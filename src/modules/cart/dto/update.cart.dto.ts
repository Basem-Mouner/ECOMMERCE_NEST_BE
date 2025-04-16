import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
} from 'class-validator';
import { Types } from 'mongoose';

@ValidatorConstraint({ name: 'Check_mongo_ids', async: false })
export class CheckMongoIds implements ValidatorConstraintInterface {
  validate(ids: Types.ObjectId[], args: ValidationArguments) {
    for (const id of ids) {
      if (!Types.ObjectId.isValid(id)) {
        return false;
      }
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Invalid mongo IDs';
  }
}

export class ItemIdsDTO {
  @Validate(CheckMongoIds)
  productIds: Types.ObjectId[];
}
