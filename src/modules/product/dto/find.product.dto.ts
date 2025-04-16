import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';
import { QueryFilterDto } from 'src/common/dto/query.filter.dto';

export class findProductFilterDto extends QueryFilterDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  name: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  minPrice: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  maxPrice: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  stock: number;
  @IsMongoId()
  @IsOptional()
  categoryId: string;
}
