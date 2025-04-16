import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';

import { CreateSignupDto } from './auth.validationSchema';
import { InjectModel } from '@nestjs/mongoose';
import { OtpEntry, User, UserDocument } from 'src/DB/models/user.model';
import { Model } from 'mongoose';
import { confirmEmailDto, createUserDto, loginDto } from './dto/auth.dto';
import { UserRepositoryService } from 'src/DB/repository/user.repository.service';
import {
  emailEvent,
  EmailService,
  subjectTypes,
} from 'src/common/events/emailEvent';
import { generateOTPAlphabet } from 'src/common/OTP/otp';
import { compareHash, generateHash } from 'src/common/security/hash.secure';
import { JwtService } from '@nestjs/jwt';
import {
  TokenService,
  TokenType,
} from 'src/common/security/service/token.service';
// 🔐
@Injectable()
export class AuthService {
  constructor(
    // @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    // private readonly jwtService: JwtService,
    private readonly TokenService: TokenService,
    // private readonly emailService: EmailService,
    private readonly UserRepositoryService: UserRepositoryService,
  ) {}

  async signup(
    body: createUserDto,
  ): Promise<{ message: string; data: Partial<createUserDto> }> {
    const { userName, password, email } = body;
    new EmailService(this.UserRepositoryService, emailEvent);

    // const codeOtp = generateOTPAlphabet(
    //   Number(process.env.OTP_EXPIRES),
    //   Number(process.env.OTP_LENGTH),
    // ); // valid for 10 minutes
    // console.log(codeOtp);

    // const checkUser = await this.userModel.findOne({ email: body.email });
    // const checkUser = await this.UserRepositoryService.findOne({
    //   filter: { email },
    // });
    // if (checkUser) {
    //   throw new ConflictException('Email already exists');
    // }
    await this.UserRepositoryService.checkDuplicateAccount({ email });
    const user = await this.UserRepositoryService.create({
      userName,
      password,
      email,
    });

    emailEvent.emit('sendConfirmEmailOtp', {
      email,
      userName,
      id: user._id,
      // codeOtp,
    });

    // await this.UserRepositoryService.updateOne({
    //   filter: { _id: user._id },
    //   updatedData: {
    //     $push: {
    //       OTP: {
    //         code: generateHash(String(codeOtp.code)),
    //         type: subjectTypes.confirmEmail,
    //         expiresAt: codeOtp.otpExpires,
    //       },
    //     },
    //   },
    // });

    return { message: 'signup', data: user };
  }

  async login(body: loginDto): Promise<{
    message: string;
    data: { token: { accessToken: string; refreshToken: string } };
  }> {
    const { password, email } = body;

    const user = await this.UserRepositoryService.findOne({
      filter: { email },
    });
    if (!user || !compareHash(password, user.password)) {
      throw new BadRequestException('In-valid login data');
    }
    if (!user.confirmEmail) {
      throw new BadRequestException('Email not confirmed verify your email');
    }

    const accessToken = this.TokenService.sign({
      role: user.role,
      payload: { id: user._id },
    });
    const refreshToken = this.TokenService.sign({
      role: user.role,
      payload: { id: user._id },
      type: TokenType.refresh,
    });

    return { message: 'Done', data: { token: { accessToken, refreshToken } } };
  }

  async confirmEmail(body: confirmEmailDto) {
    const { email, codeOtp } = body;
    const user = await this.UserRepositoryService.findOne({
      filter: { email, confirmEmail: { $exists: false } },
    });

    if (!user || user.confirmEmail) {
      throw new BadRequestException(
        'In-valid login data or email already confirmed',
      );
    }

    const otpEntry: OtpEntry | undefined = user.OTP.find(
      (entry: OtpEntry) => entry.type === (subjectTypes.confirmEmail as string),
    );

    if (!otpEntry) {
      throw new BadRequestException('OTP not found');
    }

    // if (otpEntry.expiresAt.getDate() < Date.now()) {
    //   throw new BadRequestException('OTP has expired');
    // }

    if (!compareHash(codeOtp, otpEntry.code)) {
      throw new BadRequestException('In-valid OTP');
    }

    await this.UserRepositoryService.updateOne({
      filter: { _id: user._id },
      updatedData: {
        confirmEmail: Date.now(),
        $pull: { OTP: { type: subjectTypes.confirmEmail } },
      },
    });
    return { message: 'email confirmed', data: {} };
  }
}
