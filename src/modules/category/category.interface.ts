import { Types } from 'mongoose';

import { UserDocument } from 'src/DB/models/user.model';

export interface ICategory extends ICreateCategoryInput {
  // _id: Types.ObjectId;
  slug: string;
  folderId: string;
  catImage: IAttachmentType;
  createdBy: Types.ObjectId | UserDocument;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface IAttachmentType {
  public_id: string;
  secure_url: string;
}

export interface ICreateCategoryInput {
  name: string;
}
