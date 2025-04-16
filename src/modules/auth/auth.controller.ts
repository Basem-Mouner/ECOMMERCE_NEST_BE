import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  // Param,
  // ParseBoolPipe,
  Post,
  Req,
  UsePipes,
  // ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
// import {customValidationPipe,
//   // inputSignup,
// } from 'src/common/pipes/passwordCustom.pipe';
// import { CreateSignupDto, signupSchema } from './auth.validationSchema';
import { confirmEmailDto, createUserDto, loginDto } from './dto/auth.dto';
import { customValidationPipe } from 'src/common/pipes/passwordCustom.pipe';

// @UsePipes(
//   new ValidationPipe({
//     whitelist: true,
//     forbidNonWhitelisted: true,
//     stopAtFirstError: false, // This is important to ensure that all errors are returned if true and not just the first error
//   }),
// )

@UsePipes(
  new customValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    stopAtFirstError: false, // This is important to ensure that all errors are returned if true and not just the first error
  }),
)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  // @UsePipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     forbidNonWhitelisted: true,
  //     stopAtFirstError: false, // This is important to ensure that all errors are returned if true and not just the first error
  //   }),
  // )
  @Post('signup')
  @HttpCode(201)
  signup(
    @Req() req: Request,
    // @Body('userName') username: string,
    // @Body('password') password: string,
    // @Body('email') email: string,
    // @Body('role') role: string,
    // @Body('flag', new ParseBoolPipe({ errorHttpStatusCode: 400 })) flag: boolean,
    @Body() body: createUserDto,
    // new ValidationPipe({
    //   whitelist: true,
    //   forbidNonWhitelisted: true,
    //   stopAtFirstError: false, // This is important to ensure that all errors are returned if true and not just the first error
    // }),
    // body: createUserDto, //here whitelist is used to remove the extra fields from the body and forbidNonWhitelisted is used to throw an error if there is any extra field in the body
    // @Param('id') id: string,
  ) {
    // console.log({ userName, password, email, role });
    // const { userName, password, email, role } = body;
    // console.log(req.body);
    // console.log(body);
    // console.log({ userName, password, email, role });
    // console.log(id);

    return this.authService.signup(body);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() body: loginDto) {
    return this.authService.login(body);
  }
  @Patch('confirmEmail')
  @HttpCode(200)
  confirmEmail(@Body() body: confirmEmailDto) {
    return this.authService.confirmEmail(body);
  }
}
