import { Field, ObjectType } from '@nestjs/graphql';
import { IAttachmentType, ICategory } from '../category.interface';
import { Types } from 'mongoose';
import { IUser } from 'src/modules/user/user.interface';
import {
  IAttachmentTypeResponse,
  oneUserResponse,
} from 'src/modules/user/entities/user.entity';

@ObjectType()
export class OneCategoryResponse implements ICategory {
  @Field(() => String)
  _id: Types.ObjectId;
  @Field(() => String)
  name: string;
  @Field(() => String)
  slug: string;
  @Field(() => String)
  folderId: string;
  @Field(() => IAttachmentTypeResponse, { nullable: false })
  catImage: IAttachmentType;
  @Field(() => oneUserResponse)
  createdBy: IUser;
  @Field(() => Date, { nullable: true })
  createdAt?: Date;
  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
