import { GenderTypes, OtpEntry, RoleTypes } from 'src/DB/models/user.model';
import { IAttachmentType } from '../category/category.interface';

export interface IUser {
  firstName: string;
  lastName: string;
  userName?: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  gender: GenderTypes;
  role: RoleTypes;
  image?: IAttachmentType;
  DOB?: Date;
  createdAt: Date;
  updatedAt?: Date;
  confirmEmail?: Date;
  changeCredentialsTime?: Date;
  OTP?: OtpEntry[];
}

export interface IOtpEntry {
  code: string; // OTP code
  type: string;
  expiresAt: Date; // Expiration timestamp
}
