import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { OrderDocument } from 'src/DB/models/order.model';
import { OrderRepositoryService } from 'src/DB/repository/order.repository.service';
import { OrderStatus, PaymentMethod } from 'src/modules/order/order.interface';
import Stripe from 'stripe';
import dayjs from 'dayjs';
@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    private readonly orderRepositoryService: OrderRepositoryService<OrderDocument>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_API_KEY as string);
  }

  async checkoutSession({
    line_items,
    customer_email = '',
    metadata = {},
    discounts = [],
    mode = 'payment',
    success_url = process.env.SUCCESS_URL as string,
    cancel_url = process.env.CANCEL_URL as string,
  }: Stripe.Checkout.SessionCreateParams): Promise<
    Stripe.Response<Stripe.Checkout.Session>
  > {
    return await this.stripe.checkout.sessions.create({
      line_items,
      customer_email,
      metadata,
      mode,
      success_url,
      cancel_url,
      discounts,
    });
  }
  async createCoupon(
    params: Stripe.CouponCreateParams,
  ): Promise<Stripe.Response<Stripe.Coupon>> {
    return await this.stripe.coupons.create(params);
  }
  async stripeWebhook(req: Request) {
    const body: Buffer<ArrayBufferLike> = req.body;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
    const signature = req.headers['stripe-signature'] as string;
    const event = this.stripe.webhooks.constructEvent(
      body,
      signature,
      endpointSecret,
    );
    // console.log('Webhook received:', event);
    if (event.type !== 'checkout.session.completed') {
      throw new BadRequestException('Fail to payment');
    }
    const session = event.data.object['metadata']?.orderId;
    console.log('Checkout session completed order id is:', session);
    const order = await this.orderRepositoryService.findOne({
      filter: { _id: session, status: OrderStatus.pending },
    });
    if (!order) {
      throw new BadRequestException('Order not found');
    }
    await this.confirmPaymentIntent(order.intentId as string); //to confirm the payment intent
    const now = new Date();
    const orderCreated = order?.createdAt;
    if (!orderCreated) {
      // 🕒 Check if order creation date is missing
      throw new BadRequestException('Order creation date missing');
    }
    const hoursDiff =
      (now.getTime() - new Date(orderCreated).getTime()) / (1000 * 60 * 60);
    // 🕒 Check if order was created within the last 24 hours
    if (hoursDiff > 24) {
      // update products quantity here
      throw new BadRequestException('Order expired to be paid');
    }
    await this.orderRepositoryService.updateOne({
      filter: { _id: session, status: OrderStatus.pending },
      updatedData: {
        status: OrderStatus.placed,
        paidAt: Date.now(),
      },
    });
  }

  async createPaymentIntent({
    amount,
    currency = 'egp',
    metadata = {},
  }: {
    amount: number;
    currency?: string;
    metadata?: Record<string, any>;
  }): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    const PaymentMethod = await this.createPaymentMethod();
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount * 100, // in cents, so $10 = 1000
      currency,
      payment_method: PaymentMethod.id,
      metadata,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    });

    return paymentIntent;
  }
  async createPaymentMethod(
    token: string = 'tok_visa',
  ): Promise<Stripe.Response<Stripe.PaymentMethod>> {
    const paymentMethod = await this.stripe.paymentMethods.create({
      type: 'card',
      card: { token },
    });
    return paymentMethod;
  }
  async retrievePaymentIntent(
    id: string,
  ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(id);
    return paymentIntent;
  }
  async confirmPaymentIntent(
    id: string,
  ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    const intent = await this.retrievePaymentIntent(id);
    if (!intent) {
      throw new BadRequestException('Intent not found');
    }
    const paymentIntent = await this.stripe.paymentIntents.confirm(intent.id, {
      payment_method: 'pm_card_visa',
      // return_url: process.env.SUCCESS_URL as string,
      // redirect: {
      //   return_url: process.env.SUCCESS_URL as string,
      // },
    });
    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException('Payment not confirmed');
    }
    console.log('PaymentIntent confirmed:', paymentIntent);
    return paymentIntent;
  }
  async cancelPaymentIntent(
    id: string,
  ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    const intent = await this.retrievePaymentIntent(id);
    if (!intent) {
      throw new BadRequestException('Intent not found');
    }
    const paymentIntent = await this.stripe.paymentIntents.cancel(intent.id);
    if (paymentIntent.status !== 'canceled') {
      throw new BadRequestException('Payment not canceled');
    }
    console.log('PaymentIntent canceled:', paymentIntent);
    return paymentIntent;
  }
  async refundPaymentIntent(
    id: string,
  ): Promise<Stripe.Response<Stripe.Refund>> {
    const intent = await this.retrievePaymentIntent(id);
    if (!intent) {
      throw new BadRequestException('Intent not found');
    }
    const paymentIntent = await this.stripe.refunds.create({
      payment_intent: intent.id,
      amount: intent.amount,
      reason: 'requested_by_customer',
      metadata: {
        orderId: intent.metadata.orderId,
        userId: intent.metadata.userId,
      },
    });
    console.log('PaymentIntent refunded:', paymentIntent);
    return paymentIntent;
  }
}
