import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class QueryFilterDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  select?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  sort?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @IsPositive()
  page?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @IsPositive()
  limit?: number;
}
