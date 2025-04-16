import {
  MongooseModule,
  Prop,
  raw,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import slugify from 'slugify';
import { ICart, ICartProduct } from 'src/modules/product/cart.interface';

@Schema({ timestamps: true })
export class Cart implements ICart {
  @Prop(
    raw([
      {
        productId: { type: Types.ObjectId, required: true, ref: 'Product' },
        quantity: { type: Number, default: 1 },
      },
    ]),
  )
  products: ICartProduct[];

  @Prop({ required: true, ref: 'User', type: Types.ObjectId, unique: true })
  createdBy: Types.ObjectId;
}

export type CartDocument = HydratedDocument<Cart>;
export const CartSchema = SchemaFactory.createForClass(Cart);

// export const CartModel = MongooseModule.forFeatureAsync([
//   {
//     name: Cart.name,
//     useFactory() {
//       CartSchema.pre('save', function (next) {
//         if (this.isModified('name')) {
//           this.slug = slugify(this.name, { lower: true, trim: true });
//         }
//         return next();
//       });
//     },
//   },
// ]);

export const CartModel = MongooseModule.forFeature([
  { name: Cart.name, schema: CartSchema },
]);
