import {
  MongooseModule,
  Prop,
  raw,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  IOrder,
  IOrderProduct,
  OrderStatus,
  PaymentMethod,
} from 'src/modules/order/order.interface';

@Schema({ timestamps: true })
export class Order implements IOrder {
  @Prop({ type: String, required: true })
  address: string;

  @Prop({ type: String, required: true })
  phone: string;

  @Prop({ type: String, required: false })
  note?: string;

  @Prop({ type: String, required: false })
  rejectedReason?: string;

  @Prop({ type: Date, required: false })
  paidAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;

  @Prop({ type: Number, required: false })
  discountPercent?: number;

  @Prop({ type: Number, required: true })
  finalPrice: number;

  @Prop({ type: Number, required: true })
  subTotal: number;

  @Prop({
    type: String,
    enum: OrderStatus,
    default: OrderStatus.pending,
  })
  status: OrderStatus;

  @Prop(
    raw([
      {
        name: { type: String, required: true },
        productId: { type: Types.ObjectId, required: true, ref: 'Product' },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, required: true },
        finalPrice: {
          type: Number,
          required: true,
        },
      },
    ]),
  )
  products: IOrderProduct[];

  @Prop({ type: String, enum: PaymentMethod, default: PaymentMethod.cash })
  paymentMethod: PaymentMethod;

  @Prop({
    type: String,
    default: function () {
      return `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    },
  })
  orderId: string;

  createdAt?: Date;
  updatedAt?: Date;
  @Prop({ type: String, required: false })
  intentId?: string;
  @Prop({ type: Number, required: false })
  refundAmount?: number;
  @Prop({ type: Date, required: false })
  refundDate?: Date;
}

export type OrderDocument = HydratedDocument<Order>;
export const OrderSchema = SchemaFactory.createForClass(Order);

export const OrderModel = MongooseModule.forFeature([
  { name: Order.name, schema: OrderSchema },
]);
