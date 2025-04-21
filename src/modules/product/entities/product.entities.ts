import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { IProduct, Size } from '../product.interface';
import {
  IAttachmentType,
  ICategory,
} from 'src/modules/category/category.interface';
import {
  IAttachmentTypeResponse,
  oneUserResponse,
} from 'src/modules/user/entities/user.entity';
import { IUser } from 'src/modules/user/user.interface';
import { OneCategoryResponse } from 'src/modules/category/entities/category.entities';

registerEnumType(Size, {
  name: 'Size',
});
@ObjectType()
export class OneProductResponse implements Partial<IProduct> {
  @Field(() => ID, { nullable: true })
  _id: Types.ObjectId;
  @Field(() => String, { nullable: false })
  name: string;
  @Field(() => Number, { nullable: false })
  stock: number;
  @Field(() => Number, { nullable: false })
  finalPrice: number;

  @Field(() => String, { nullable: false })
  slug: string;
  @Field(() => String, { nullable: false })
  folderId: string;
  @Field(() => IAttachmentTypeResponse, { nullable: false })
  image?: IAttachmentType;
  @Field(() => [IAttachmentTypeResponse], { nullable: true })
  gallery?: IAttachmentType[];

  @Field(() => oneUserResponse)
  createdBy: IUser;
  @Field(() => ID, { nullable: true })
  createAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
  @Field(() => Number, { nullable: false })
  originalPrice: number;
  @Field(() => Number, { nullable: true })
  discountPercent?: number; // %
  @Field(() => String)
  description: string;
  @Field(() => OneCategoryResponse, { nullable: false })
  categoryId: ICategory;
  @Field(() => [Size], { nullable: true })
  size?: Size[];
  @Field(() => [String], { nullable: true })
  colors?: string[];
}
