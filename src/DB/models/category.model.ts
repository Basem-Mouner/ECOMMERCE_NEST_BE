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

@Schema({ timestamps: true })
export class Category implements ICategory {
  @Prop({ type: Types.ObjectId })
  _id: Types.ObjectId;
  @Prop({ required: true, minlength: 2, maxlength: 50, unique: true })
  name: string;

  @Prop({
    minlength: 2,
    maxlength: 75,
    // required: true,
    // default: function (this: Category) {
    //   return slugify(this.name, { lower: true, trim: true });
    // },
  })
  slug: string;

  @Prop(
    raw({
      public_id: { type: String, required: true },
      secure_url: { type: String, required: true },
    }),
  )
  catImage: IAttachmentType;

  @Prop({ type: String, required: true })
  folderId: string;

  @Prop({ required: true, ref: 'User', type: Types.ObjectId })
  createdBy: Types.ObjectId;
}

export type CategoryDocument = HydratedDocument<Category>;
export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.pre('save', function (next) {
  if (!this.slug || this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, trim: true });
  }
  return next();
});
CategorySchema.pre('updateOne', function (next) {
  console.log(this.getUpdate());
  const update: Record<string, any> =
    (this.getUpdate() as Record<string, any>) ?? {}; // ضمان عدم كون update null أو undefined

  if (typeof update.name === 'string') {
    update.slug = slugify(update.name, { lower: true, trim: true });
  }

  return next();
});

// export const CategoryModel = MongooseModule.forFeatureAsync([
//   {
//     name: Category.name,
//     useFactory() {
//       CategorySchema.pre('save', function (next) {
//         if (this.isModified('name')) {
//           this.slug = slugify(this.name, { lower: true, trim: true });
//         }
//         return next();
//       });
//     },
//   },
// ]);

export const CategoryModel = MongooseModule.forFeature([
  { name: Category.name, schema: CategorySchema },
]);
