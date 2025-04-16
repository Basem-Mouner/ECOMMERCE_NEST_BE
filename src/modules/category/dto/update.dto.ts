import { PartialType } from '@nestjs/mapped-types';
import {
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';

import { Types } from 'mongoose';
import { CreateCategoryDto } from './createCategory.dto';

export class CategoryId {
  @IsMongoId()
  categoryId: Types.ObjectId;
}

export class UpdateCategoryDTO extends PartialType(CreateCategoryDto) {
  // @IsString()
  // @MinLength(2)
  // @MaxLength(50)
  // @IsOptional()
  // name: string;
}

// import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, Validate } from 'class-validator';
// import { Types } from 'mongoose';

// // إنشاء كلاس مخصص للتحقق من ObjectId
// @ValidatorConstraint({ name: 'IsObjectId', async: false })
// export class IsObjectId implements ValidatorConstraintInterface {
//   validate(value: string) {
//     return Types.ObjectId.isValid(value);
//   }

//   defaultMessage(args: ValidationArguments) {
//     return `${args.property} يجب أن يكون ObjectId صالحًا!`;
//   }
// }

// // استخدام الفاليديتور المخصص داخل كلاس DTO
// export class CategoryId {
//   @Validate(IsObjectId)
//   categoryId: string;
// }
