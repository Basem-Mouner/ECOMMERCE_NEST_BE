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

export class findCategoryFilterDto extends QueryFilterDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  name: string;
}
