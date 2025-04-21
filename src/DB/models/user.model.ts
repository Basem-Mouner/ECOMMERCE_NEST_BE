import {
  MongooseModule,
  Prop,
  raw,
  Schema,
  SchemaFactory,
  Virtual,
} from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { generateHash } from 'src/common/security/hash.secure';
import { IAttachmentType } from 'src/modules/category/category.interface';

export enum GenderTypes {
  male = 'male',
  female = 'female',
}

export enum RoleTypes {
  user = 'user',
  admin = 'admin',
}
export class OtpEntry {
  @Prop()
  code: string; // OTP code

  @Prop()
  type: string;

  @Prop()
  expiresAt: Date; // Expiration timestamp
}

@Schema({
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
})
export class User {
  @Prop({ required: true, minlength: 2, maxlength: 50, trim: true })
  firstName: string;

  @Prop({ required: true, minlength: 2, maxlength: 50, trim: true })
  lastName: string;

  @Virtual({
    get: function (this: User) {
      return `${this.firstName} ${this.lastName}`;
    },
    set(this: User, value: string) {
      const [firstName, lastName] = value.split(' ');
      this.firstName = firstName;
      this.lastName = lastName;
    },
  })
  userName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, enum: GenderTypes, default: GenderTypes.male })
  gender: GenderTypes;

  @Prop({ type: String, enum: RoleTypes, default: RoleTypes.user })
  role: RoleTypes;

  @Prop()
  phone: string;

  @Prop()
  address: string;

  @Prop({ type: Date })
  confirmEmail: Date;

  @Prop({ type: Date })
  changeCredentialsTime: Date;

  @Prop({ type: [OtpEntry] }) // Array of OTP objects
  OTP: OtpEntry[];
  @Prop(
    raw({
      public_id: { type: String },
      secure_url: { type: String },
    }),
  )
  image: IAttachmentType;

  @Prop({ type: Date })
  DOB: Date;
}

export type UserDocument = HydratedDocument<User>; //return document type contain document&User
export const UserSchema = SchemaFactory.createForClass(User); //converts the User ts class to a schema mongoose

// ✅ 📌 Hash password before saving..... create trigger save also
UserSchema.pre('save', function () {
  if (this.isDirectModified('password')) {
    this.password = generateHash(this.password);
  }
  // this.mobileNumber=generateEncryption(this.mobileNumber);
});
export const UserModel = MongooseModule.forFeature([
  {
    name: User.name,
    schema: UserSchema,
    // useFactory() {
    //   UserSchema.pre('save', function (next) {
    //     if (this.isDirectModified('password')) {
    //       this.password = generateHash(this.password);
    //     }
    //     return next();
    //   });
    //   return UserSchema;
    // },
  },
]); //converts the UserSchema to a mongoose model
export const socketUserConnections = new Map();
