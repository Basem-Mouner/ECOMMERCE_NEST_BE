import { Types } from 'mongoose';
import { ProductDocument } from 'src/DB/models/product.model';
import { IUser } from '../user/user.interface';
import { IProduct } from '../product/product.interface';

export enum PaymentMethod {
  cash = 'cash',
  card = 'card',
}
export enum OrderStatus {
  pending = 'pending',
  placed = 'placed',
  onWay = 'on_way',
  delivered = 'delivered',
  canceled = 'canceled',
  pickup = 'pickup',
}
// export enum OrderType {
//   delivery = 'delivery',
//   pickup = 'pickup',
// }
export interface IOrderProduct {
  _id?: Types.ObjectId;
  name: string;
  quantity: number;
  unitPrice: number;
  finalPrice: number;
  productId: Types.ObjectId | IProduct;
}

export interface IOrder extends IOrderInputs {
  _id?: Types.ObjectId;
  paidAt?: Date;
  rejectedReason?: string;
  products: IOrderProduct[];
  status: OrderStatus;
  subTotal: number;
  discountPercent?: number;
  finalPrice: number;
  orderId: string;
  intentId?: string;
  createdBy?: Types.ObjectId | IUser;
  createdAt?: Date;
  updatedBy?: Types.ObjectId | IUser;
  updatedAt?: Date;
}
export interface IOrderInputs {
  address: string;
  phone: string;
  note?: string;
  paymentMethod: PaymentMethod;
}
