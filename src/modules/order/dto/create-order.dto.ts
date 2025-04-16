import {
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IOrderInputs, PaymentMethod } from '../order.interface';
import { Types } from 'mongoose';
export class OrderIdDto {
  @IsMongoId()
  orderId: Types.ObjectId;

  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  @IsOptional()
  rejectedReason?: string;
}
export class CreateOrderDto implements IOrderInputs {
  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  address: string;

  @Matches(/^(002|\+2)?01[0125][0-9]{8}$/)
  phone: string;

  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  @IsOptional()
  note?: string;

  @IsString()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod; // PaymentMethod

  @IsNumber()
  @IsPositive()
  @Max(100)
  @IsOptional()
  discountPercent: number;
}
