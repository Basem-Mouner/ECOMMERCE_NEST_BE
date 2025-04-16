// import {
//   PipeTransform,
//   Injectable,
//   ArgumentMetadata,
//   //   HttpException,
//   BadRequestException,
// } from '@nestjs/common';
// import { CreateSignupDto } from 'src/modules/auth/auth.validationSchema';
// import { ZodSchema } from 'zod';

// export interface inputSignup {
//   userName: string;
//   email: string;
//   password: string;
//   confirmationPassword: string;
// }

// @Injectable()
// export class customValidationPipe implements PipeTransform {
//   constructor(private schema: ZodSchema) {}
//   transform(value: CreateSignupDto, metadata: ArgumentMetadata) {
//     try {
//       console.log('value', value);
//       console.log('metadata', metadata);

//       const parsedValue  = this.schema.parse(value);

//       //   if (value.password !== value.confirmationPassword) {
//       //     throw new BadRequestException(
//       //       'Password and confirmation password do not match',
//       //     );
//       //   }
//       return parsedValue;
//     } catch (error) {
//       throw new BadRequestException(error);
//     }
//   }
// }

import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  ValidationPipeOptions,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class customValidationPipe implements PipeTransform<any> {
  constructor(private options?: ValidationPipeOptions) {}
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype, value);
    const errors = await validate(object, this.options);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
