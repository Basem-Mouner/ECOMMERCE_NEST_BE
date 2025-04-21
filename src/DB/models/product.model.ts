import {
  MongooseModule,
  Prop,
  raw,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import slugify from 'slugify';
import {
  IAttachmentType,
  ICategory,
} from 'src/modules/category/category.interface';
import { IProduct, Size } from 'src/modules/product/product.interface';

@Schema({ timestamps: true })
export class Product implements IProduct {
  @Prop({ type: Types.ObjectId })
  _id: Types.ObjectId;
  @Prop({ unique: false, minlength: 2, maxlength: 50 })
  name: string;

  @Prop({ minlength: 2, maxlength: 75 })
  slug: string;

  @Prop({ minlength: 2, maxlength: 500 })
  description: string;
  @Prop({ default: 0 })
  stock: number;
  @Prop({ type: Number, default: 0, required: true })
  originalPrice: number;
  @Prop({ type: Number, required: false })
  discountPercent?: number;

  @Prop({ type: Number })
  finalPrice: number;

  @Prop({ type: Array<Size>, enum: Size })
  size?: Size[];

  @Prop({ type: Array<string> })
  colors?: string[];

  @Prop(
    raw({
      public_id: { type: String, required: true },
      secure_url: { type: String, required: true },
    }),
  )
  image: IAttachmentType;

  @Prop([
    raw({
      public_id: { type: String },
      secure_url: { type: String },
    }),
  ])
  gallery?: IAttachmentType[];

  @Prop({ type: String })
  folderId: string;

  @Prop({ required: true, ref: 'User', type: Types.ObjectId })
  createdBy: Types.ObjectId;
  @Prop({ required: true, ref: 'Category', type: Types.ObjectId })
  categoryId: Types.ObjectId;
}

export type ProductDocument = HydratedDocument<Product>;
export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, trim: true });
  }
  if (this.isModified('originalPrice') || this.isModified('discountPercent')) {
    const result = Math.floor(
      this.originalPrice -
        (this.originalPrice * (this.discountPercent || 0)) / 100,
    );
    this.finalPrice = result > 0 ? result : 0;
  }
  return next();
});
ProductSchema.pre('updateOne', function (next) {
  // console.log(this.getUpdate());
  const update: Record<string, any> =
    (this.getUpdate() as Record<string, any>) ?? {}; // ضمان عدم كون update null أو undefined

  // if (update.originalPrice || update.discountPercent) {
  //   const result = Math.floor(
  //     update.originalPrice -
  //       (update.originalPrice * (update.discountPercent || 0)) / 100,
  //   );
  //   update.finalPrice = result > 0 ? result : 0;
  // }

  if (typeof update.name === 'string') {
    update.slug = slugify(update.name, { lower: true, trim: true });
  }

  return next();
});

export const ProductModel = MongooseModule.forFeature([
  { name: Product.name, schema: ProductSchema },
]);
