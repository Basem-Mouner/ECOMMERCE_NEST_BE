import { BadRequestException, Injectable } from '@nestjs/common';
import { CartDocument } from 'src/DB/models/cart.model';
import { UserDocument } from 'src/DB/models/user.model';
import { CartRepositoryService } from 'src/DB/repository/cart.repository.service';
import { AddCartDto } from './dto/addCart.dto';
import { ProductRepositoryService } from 'src/DB/repository/product.repository.service';
import { ItemIdsDTO } from './dto/update.cart.dto';
import { ICart } from '../product/cart.interface';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepositoryService: CartRepositoryService<CartDocument>,
    private readonly productRepositoryService: ProductRepositoryService,
  ) {}
  async addToCart(user: UserDocument, body: AddCartDto) {
    const { productId, quantity } = body;

    const product = await this.productRepositoryService.findOne({
      filter: { _id: productId, stock: { $gte: quantity } },
    });

    if (!product) {
      throw new BadRequestException('Product not found or out of stock');
    }

    const cart = await this.cartRepositoryService.findOne({
      filter: { createdBy: user._id },
    });

    if (!cart) {
      await this.cartRepositoryService.create({
        createdBy: user._id,
        products: [{ productId, quantity }],
      });
      return { message: 'Product added to cart' };
    }
    let match: boolean = false;
    for (const [index, product] of cart.products.entries()) {
      if (product.productId.toString() === productId.toString()) {
        cart.products[index].quantity = quantity;
        match = true;
        break;
      }
    }

    if (!match) {
      cart.products.push({ productId, quantity });
    }

    await cart.save();
    return { message: 'Product added to cart' };
  }

  async removeItemFromCart(
    user: UserDocument,
    body: ItemIdsDTO,
  ): Promise<{ message: string }> {
    const cart = await this.cartRepositoryService.updateOne({
      filter: { createdBy: user._id },
      updatedData: {
        $pull: { products: { productId: { $in: body.productIds } } },
      },
    });

    return { message: 'Product removed from cart' };
  }

  async clearCart(user: UserDocument): Promise<{ message: string }> {
    await this.cartRepositoryService.updateOne({
      filter: { createdBy: user._id },
      updatedData: {
        $set: { products: [] },
      },
    });

    return { message: 'Cart cleared' };
  }

  async getCart(
    user: UserDocument,
  ): Promise<{ message: string; data: { cart: ICart | null } }> {
    const cart = await this.cartRepositoryService.findOne({
      filter: { createdBy: user._id },
      populate: [{ path: 'products.productId' }],
    });

    if (!cart) {
      throw new BadRequestException('User does not have cart');
    }

    return { message: 'Done', data: { cart } };
  }
}
