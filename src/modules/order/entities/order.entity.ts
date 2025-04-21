import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import {
  IOrder,
  IOrderProduct,
  OrderStatus,
  PaymentMethod,
} from '../order.interface';
import { Types } from 'mongoose';
import { OneProductResponse } from 'src/modules/product/entities/product.entities';
import { IUser } from 'src/modules/user/user.interface';
import { oneUserResponse } from 'src/modules/user/entities/user.entity';
import { IProduct } from 'src/modules/product/product.interface';

registerEnumType(PaymentMethod, {
  name: 'PaymentMethod',
});
registerEnumType(OrderStatus, {
  name: 'OrderStatus',
});

@ObjectType()
export class OneOrderResponse implements IOrder {
  @Field(() => ID, { nullable: true })
  _id: Types.ObjectId;

  @Field(() => String)
  address: string;

  @Field(() => String, { nullable: true })
  note?: string;

  @Field(() => Number, { nullable: true })
  discountPercent?: number;

  @Field(() => Number, { nullable: false })
  finalPrice: number;
  @Field(() => OrderStatus)
  status: OrderStatus;
  @Field(() => Number, { nullable: false })
  subTotal: number;
  @Field(() => String, { nullable: true })
  intentId?: string;

  @Field(() => String)
  orderId: string;

  @Field(() => Date)
  createdAt: Date;
  @Field(() => oneUserResponse)
  createdBy: IUser;
  @Field(() => ID, { nullable: true })
  updatedBy?: Types.ObjectId;
  @Field(() => Date, { nullable: true })
  updatedAt?: Date;

  @Field(() => String)
  phone: string;

  @Field(() => String, { nullable: true })
  rejectedReason?: string;

  @Field(() => Date, { nullable: true })
  paidAt?: Date;

  @Field(() => PaymentMethod, { nullable: false })
  paymentMethod: PaymentMethod;

  @Field(() => [IOrderProductResponse], { nullable: false })
  products: IOrderProduct[];
}

@ObjectType()
export class IOrderProductResponse implements IOrderProduct {
  @Field(() => ID, { nullable: true })
  _id?: Types.ObjectId;
  @Field(() => OneProductResponse, { nullable: false })
  productId: IProduct;
  @Field(() => String, { nullable: false })
  name: string;
  @Field(() => Number, { nullable: false })
  quantity: number;
  @Field(() => Number, { nullable: false })
  unitPrice: number;
  @Field(() => Number, { nullable: false })
  finalPrice: number;
}
