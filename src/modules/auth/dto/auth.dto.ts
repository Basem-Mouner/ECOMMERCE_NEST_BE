import { BadRequestException } from '@nestjs/common';
import {
  MaxLength,
  MinLength,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  IsEmail,
  ValidateIf,
  IsOptional,
  Matches,

  //   Allow,
  //   IsOptional,
} from 'class-validator';
import { IsMatchPassword } from 'src/common/decorators/password.custom.decorators';

export class loginDto {
  @IsEmail(
    {
      allow_ip_domain: false,
      allow_utf8_local_part: true,
      require_tld: true,
    },
    { message: 'Invalid email address' },
  )
  email: string;

  @IsStrongPassword()
  password: string;
}
export class createUserDto extends loginDto {
  @IsString({ message: 'User name is required' })
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  userName: string;

  //   @ValidateIf((o: createUserDto) => {
  //     if (o.password !== o.confirmationPassword) {
  //       throw new BadRequestException(
  //         'Password and confirmation password do not match',
  //       );
  //     }
  //     return true;
  //   })
  //   @IsStrongPassword()

  @IsMatchPassword({
    message: 'Password and confirmation password do not match',
  })
  confirmationPassword: string;

  //   @Allow()   //This is used to allow the extra fields in the body not make validation on this field
  //   @IsOptional()
  //   DOB: string;
}

export class confirmEmailDto {
  @IsEmail(
    {
      allow_ip_domain: false,
      allow_utf8_local_part: true,
      require_tld: true,
    },
    { message: 'Invalid email address' },
  )
  email: string;

  @IsNotEmpty()
  @Matches(new RegExp(`^[0-9]{${process.env.OTP_LENGTH || 4}}$`))
  codeOtp: string;
}
