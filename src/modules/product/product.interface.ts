import { Types } from 'mongoose';
import { IAttachmentType, ICategory } from '../category/category.interface';
import { UserDocument } from 'src/DB/models/user.model';

export enum Size {
  S = 's',
  M = 'm',
  L = 'l',
  XL = 'xl',
  XXL = 'xxl',
  XXXL = 'xxxl',
}

export interface IProductInput {
  name: string;

  description: string;

  stock: number;
  originalPrice: number;
  discountPercent?: number; // %

  size?: Size[];
  colors?: string[];

  categoryId: Types.ObjectId | ICategory;
}
export interface IProduct extends IProductInput {
  // _id: Types.ObjectId;

  //   name: string;
  slug: string;
  //   description: string;

  //   stock: number;
  //   originalPrice: number;
  //   discountPercent?: number; // %
  finalPrice: number;

  //   size?: Size[];
  //   colors?: string[];
  folderId: string;

  image: IAttachmentType;
  gallery?: IAttachmentType[];

  createdBy: Types.ObjectId | UserDocument;
  //   categoryId: Types.ObjectId | ICategory;

  createAt?: Date;
  updatedAt?: Date;
}
