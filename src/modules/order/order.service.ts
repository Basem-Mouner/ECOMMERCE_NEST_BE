import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UserDocument } from 'src/DB/models/user.model';
import { OrderRepositoryService } from 'src/DB/repository/order.repository.service';
import { OrderDocument } from 'src/DB/models/order.model';
import { CartService } from '../cart/cart.service';
import { CartDocument } from 'src/DB/models/cart.model';
import { CartRepositoryService } from 'src/DB/repository/cart.repository.service';
import { UserRepositoryService } from 'src/DB/repository/user.repository.service';
import { ProductRepositoryService } from 'src/DB/repository/product.repository.service';
import {
  IOrder,
  IOrderProduct,
  OrderStatus,
  PaymentMethod,
} from './order.interface';
import { PaymentService } from 'src/common/services/payment.service';
import { Types } from 'mongoose';
import Stripe from 'stripe';
import { Request } from 'express';
import { RealTimeGateway } from '../gateway/gateway';
@Injectable()
export class OrderService {
  constructor(
    private readonly cartService: CartService,
    private readonly cartRepositoryService: CartRepositoryService<CartDocument>,
    private readonly orderRepositoryService: OrderRepositoryService<OrderDocument>,
    private readonly userRepositoryService: UserRepositoryService,
    private readonly productRepositoryService: ProductRepositoryService,
    private readonly paymentService: PaymentService,
    private readonly realTimeGateway: RealTimeGateway,
  ) {}
  async create(
    user: UserDocument,
    body: CreateOrderDto,
  ): Promise<{ message: string }> {
    const cart = await this.cartRepositoryService.findOne({
      filter: { createdBy: user._id },
    });

    if (!cart?.products?.length) {
      throw new BadRequestException('Empty cart');
    }
    const products: IOrderProduct[] = [];
    let subTotal: number = 0;
    for (const product of cart.products) {
      const productData = await this.productRepositoryService.findOne({
        filter: { _id: product.productId, stock: { $gte: product.quantity } },
      });
      if (!productData) {
        throw new BadRequestException(
          `Product not found or not enough stock which id is  ${product.productId.toString()}`,
        );
      }

      products.push({
        name: productData.name,
        quantity: product.quantity,
        unitPrice: productData.finalPrice,
        finalPrice: productData.finalPrice * product.quantity,
        productId: product.productId,
      });
      subTotal += productData.finalPrice * product.quantity;
    }
    let finalPrice = subTotal;
    if (body.discountPercent) {
      finalPrice = Math.floor(
        subTotal - (subTotal * body.discountPercent) / 100,
      );
    }
    const order = await this.orderRepositoryService.create({
      ...body,
      createdBy: user._id,
      updatedBy: user._id,
      products,
      subTotal,
      finalPrice,
      discountPercent: body.discountPercent,
    });

    await this.cartService.clearCart(user);
    const productStock:
      | { productId: Types.ObjectId; quantity: number }
      | { productId: Types.ObjectId; quantity: number }[] = [];
    for (const product of products) {
      const item = await this.productRepositoryService.findOneAndUpdate({
        filter: { _id: product.productId },
        updatedData: { $inc: { stock: -product.quantity } },
      });
      productStock.push({
        productId: item?._id as Types.ObjectId,
        quantity: item?.stock as number,
      });
    }
    this.realTimeGateway.emitSocketChanges(productStock);

    return { message: 'Done adds a new order' };
  }

  async checkout(
    user: UserDocument,
    orderId: Types.ObjectId,
  ): Promise<{
    Message: string;
    data: { session: Stripe.Response<Stripe.Checkout.Session> };
  }> {
    const order = await this.orderRepositoryService.findOne({
      filter: {
        _id: orderId,
        createdBy: user._id,
        status: OrderStatus.pending,
        paymentMethod: PaymentMethod.card,
      },
      populate: [{ path: 'products.productId', select: 'name' }],
    });
    if (!order) {
      throw new BadRequestException('Order not found');
    }
    const discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];
    if (order.discountPercent) {
      const coupon = await this.paymentService.createCoupon({
        percent_off: order.discountPercent,
        duration: 'once',
        id: `order-${order._id.toString()}`,
      });

      discounts.push({
        coupon: coupon.id,
      });
    }

    const session = await this.paymentService.checkoutSession({
      line_items: order.products.map((product) => ({
        price_data: {
          currency: 'egp',
          product_data: {
            name: product.name,
          },
          unit_amount: product.unitPrice * 100,
        },
        quantity: product.quantity,
      })),
      customer_email: user.email,
      metadata: {
        orderId: order._id.toString(),
        userId: user._id.toString(),
      },
      success_url: `${process.env.SUCCESS_URL as string}/order/${order._id.toString()}/success`,
      cancel_url: `${process.env.SUCCESS_URL as string}/order/${order._id.toString()}/cancel`,
      discounts,
    });
    const intent = await this.paymentService.createPaymentIntent({
      amount: order.finalPrice,
      currency: 'egp',
      metadata: {
        orderId: order._id.toString(),
        userId: user._id.toString(),
      },
    });
    await this.orderRepositoryService.updateOne({
      filter: { _id: orderId },
      updatedData: {
        intentId: intent.id,
      },
    });

    return { Message: 'Done', data: { session } };
  }
  async stripeWebhook(req: Request) {
    await this.paymentService.stripeWebhook(req);
  }

  async cancelOrder(
    user: UserDocument,
    orderId: Types.ObjectId,
  ): Promise<{ Message: string }> {
    const order = await this.orderRepositoryService.findOne({
      filter: {
        _id: orderId,
        createdBy: user._id,
        $or: [{ status: OrderStatus.pending }, { status: OrderStatus.placed }],
      },
      populate: [{ path: 'products.productId', select: 'name' }],
    });
    if (!order) {
      throw new BadRequestException('Order not found');
    }
    let refund = {};
    if (
      order.status === OrderStatus.placed &&
      order.paymentMethod === PaymentMethod.card
    ) {
      //refund
      refund = { refundAmount: order.finalPrice, refundDate: new Date() };
      await this.paymentService.refundPaymentIntent(order.intentId as string);
    }

    await this.orderRepositoryService.updateOne({
      filter: { _id: orderId },
      updatedData: {
        status: OrderStatus.canceled,
        rejectedReason: 'User canceled the order',
        updatedBy: user._id,
        ...refund,
      },
    });
    for (const product of order.products) {
      await this.productRepositoryService.updateOne({
        filter: { _id: product.productId },
        updatedData: { $inc: { stock: product.quantity } },
      });
    }
    return { Message: 'Done' };
  }

  async findAllOrder(): Promise<any> {
    const orders = await this.orderRepositoryService.findAll({
      filter: {},
      populate: [{ path: 'createdBy' }, { path: 'products.productId' }],
    });
    return orders;
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} order`;
  // }

  // update(id: number, updateOrderDto: UpdateOrderDto) {
  //   return `This action updates a #${id} order`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} order`;
  // }
}
