import {
  IsArray,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IProductInput, Size } from '../product.interface';
import { Types } from 'mongoose';
import { ICategory } from 'src/modules/category/category.interface';
import { Type } from 'class-transformer';

export class CreateProductDto implements IProductInput {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsString()
  @Length(2, 50000)
  description: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  stock: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  originalPrice: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  discountPercent?: number;

  @IsArray()
  @IsOptional()
  size?: Size[];

  @IsArray()
  @IsOptional()
  colors?: string[];

  @IsMongoId()
  categoryId: Types.ObjectId;
}

export class createProductFileDto {
  @IsArray()
  image: Express.Multer.File[];
  @IsArray()
  @IsOptional()
  gallery?: Express.Multer.File[];
}
