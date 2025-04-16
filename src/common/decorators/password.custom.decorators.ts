import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsMatchPasswordConstraint implements ValidatorConstraintInterface {
  validate(confirmationPassword: string, args: ValidationArguments) {
    console.log({ confirmationPassword, args });
    const password = (args.object as any)[args.constraints[0]];

    return confirmationPassword == password;
  }
}

export function IsMatchPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor, //The class that contains the property
      propertyName: propertyName, //The name of the property assigned to the decorator
      options: validationOptions, // {message: 'error message'}, groups, etc
      constraints: ['password'], //The constraints that will be passed to the validator ['password']
      validator: IsMatchPasswordConstraint, //The class that will perform the validation
    });
  };
}
