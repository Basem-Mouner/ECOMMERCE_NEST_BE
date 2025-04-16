import { Type } from 'class-transformer';
import { IsMongoId, IsNumber } from 'class-validator';
import { Types } from 'mongoose';

export class AddCartDto {
  @IsMongoId()
  productId: Types.ObjectId;
  @Type(() => Number)
  @IsNumber()
  quantity: number;
}
