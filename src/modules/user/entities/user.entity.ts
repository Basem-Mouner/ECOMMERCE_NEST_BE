import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IOtpEntry, IUser } from '../user.interface';
import { GenderTypes, OtpEntry, RoleTypes } from 'src/DB/models/user.model';
import { IAttachmentType } from 'src/modules/category/category.interface';

registerEnumType(GenderTypes, {
  name: 'GenderTypes',
});
registerEnumType(RoleTypes, {
  name: 'RoleTypes',
});
@ObjectType()
export class IAttachmentTypeResponse implements IAttachmentType {
  @Field(() => String, { nullable: true })
  public_id: string;
  @Field(() => String, { nullable: true })
  secure_url: string;
}
@ObjectType()
export class OtpEntryResponse implements IOtpEntry {
  @Field(() => String)
  code: string; // OTP code

  @Field(() => String)
  type: string;

  @Field(() => Date)
  expiresAt: Date; // Expiration timestamp
}

@ObjectType()
export class oneUserResponse implements Partial<IUser> {
  @Field(() => String, { nullable: false })
  firstName: string;
  @Field(() => String, { nullable: false })
  lastName: string;
  @Field(() => String, { nullable: true })
  userName?: string;
  @Field(() => String, { nullable: false })
  email: string;
  @Field(() => String, { nullable: false })
  password: string;
  @Field(() => String, { nullable: true })
  phone?: string;
  @Field(() => String, { nullable: true })
  address?: string;
  @Field(() => GenderTypes)
  gender: GenderTypes;
  @Field(() => RoleTypes)
  role: RoleTypes;
  @Field(() => IAttachmentTypeResponse, { nullable: true })
  image?: IAttachmentType;
  @Field(() => Date, { nullable: true })
  DOB?: Date;
  @Field(() => Date)
  createdAt: Date;
  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
  @Field(() => Date, { nullable: true })
  confirmEmail?: Date;
  @Field(() => Date, { nullable: true })
  changeCredentialsTime?: Date;
  @Field(() => [OtpEntryResponse], { nullable: true })
  OTP?: IOtpEntry[];
}
