import { Types } from 'mongoose';
import { IAttachmentType, ICategory } from '../category/category.interface';
import { UserDocument } from 'src/DB/models/user.model';
import { IUser } from '../user/user.interface';

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
  _id: Types.ObjectId;
  slug: string;
  finalPrice: number;
  folderId: string;
  image: IAttachmentType;
  gallery?: IAttachmentType[];
  createdBy: Types.ObjectId | IUser;
  createAt?: Date;
  updatedAt?: Date;
}
