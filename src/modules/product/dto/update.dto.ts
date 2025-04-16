import { IsArray, IsMongoId, IsOptional } from 'class-validator';
import { Types } from 'mongoose';
import { CreateProductDto } from './create.product.dto';
import { PartialType } from '@nestjs/mapped-types';

export class productIdDto {
  @IsMongoId()
  productId: Types.ObjectId;
}

export class updateProductDto extends PartialType(CreateProductDto) {}

export class updateProductFileDto {
  @IsArray()
  @IsOptional()
  image?: Express.Multer.File[];
  @IsArray()
  @IsOptional()
  gallery?: Express.Multer.File[];
}
