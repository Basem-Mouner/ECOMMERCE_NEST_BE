import { IsString, Length } from 'class-validator';
import { ICreateCategoryInput } from '../category.interface';

export class CreateCategoryDto implements ICreateCategoryInput {
  @IsString()
  @Length(2, 50)
  name: string;
}
