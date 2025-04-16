import { EventEmitter } from 'node:events';
import { sendEmail } from '../email/sendEmail';
import { otpTemplateDesign } from '../templates/otpEmail';
import { generateOTPAlphabet, OTP } from '../OTP/otp';
import { generateHash } from '../security/hash.secure';
import { UserRepositoryService } from 'src/DB/repository/user.repository.service';
import { User, UserDocument, UserModel } from 'src/DB/models/user.model';
import { Injectable } from '@nestjs/common';

export enum subjectTypes {
  confirmEmail = 'confirmEmail',
  resetPassword = 'resetPassword',
  updateEmail = 'updateEmail',
  twoStepVerification = 'twoStepVerification',
  restoreAccount = 'restoreAccount',
}

export interface emailData {
  id: string;
  email: string;
  userName: string;
  // codeOtp?: OTP;
}

//_______________________________________________________
export const emailEvent: EventEmitter = new EventEmitter();

//send otp to confirm email
// emailEvent.on('sendConfirmEmailOtp', (data: emailData) => {
//   sendCode({ data, subject: subjectTypes.confirmEmail }).catch((err) =>
//     console.error('Error sending OTP email:', err),
//   );
// });

// emailEvent.on('sendConfirmEmailOtp', async (data: emailData): Promise<void> => {
//   await sendCode({ data, subject: subjectTypes.confirmEmail });
// });

//_______________________________________________________
@Injectable()
export class EmailService {
  constructor(
    private readonly userRepositoryService: UserRepositoryService,
    private emailEvent: EventEmitter,
  ) {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.emailEvent.on('sendConfirmEmailOtp', (data: emailData) => {
      this.sendCode({ data, subject: subjectTypes.confirmEmail }).catch((err) =>
        console.error('Error sending OTP email:', err),
      );
    });
  }

  sendCode = async ({
    data,
    subject = subjectTypes.confirmEmail,
  }: {
    data: emailData;
    subject?: string;
  }) => {
    const { id, email, userName } = data;

    const codeOtp = generateOTPAlphabet(
      Number(process.env.OTP_EXPIRES),
      Number(process.env.OTP_LENGTH),
    ); // valid for 10 minutes
    const html = otpTemplateDesign(codeOtp.code, userName);

    let updateData = {};

    switch (subject as subjectTypes) {
      case subjectTypes.confirmEmail:
        updateData = {
          // otp: generateHash(String(codeOtp.code)),
          // otpExpires: codeOtp.otpExpires,
          $push: {
            OTP: {
              code: generateHash(String(codeOtp.code)),
              type: subjectTypes.confirmEmail,
              expiresAt: codeOtp.otpExpires,
            },
          },
        };
        break;
      case subjectTypes.resetPassword:
        updateData = {
          $push: {
            OTP: {
              code: generateHash(String(codeOtp.code)),
              type: subjectTypes.resetPassword,
              expiresAt: codeOtp.otpExpires,
            },
          },
        };
        break;
      case subjectTypes.updateEmail:
        updateData = {
          // updatedEmailOtp: generateHash(String(codeOtp.code)),
          // updatedEmailOtpExpires: codeOtp.otpExpires,
          $push: {
            OTP: {
              code: generateHash(String(codeOtp.code)),
              type: subjectTypes.updateEmail,
              expiresAt: codeOtp.otpExpires,
            },
          },
        };
        break;
      case subjectTypes.twoStepVerification:
        updateData = {
          // twoStepVerificationOtp: generateHash(String(codeOtp.code)),
          // twoStepVerificationOtpExpires: codeOtp.otpExpires,
          $push: {
            OTP: {
              code: generateHash(String(codeOtp.code)),
              type: subjectTypes.twoStepVerification,
              expiresAt: codeOtp.otpExpires,
            },
          },
        };
        break;
      case subjectTypes.restoreAccount:
        updateData = {
          $push: {
            OTP: {
              code: generateHash(String(codeOtp.code)),
              type: subjectTypes.restoreAccount,
              expiresAt: codeOtp.otpExpires,
            },
          },
        };
        break;

      default:
        break;
    }

    //assign otp in user DB model
    await this.userRepositoryService.updateOne({
      filter: { _id: id },
      updatedData: updateData,
    });

    // console.log({updateData});

    // send email
    await sendEmail({
      to: email,
      subject,
      html,
    });
  };
}

// const sendCode = async ({
//   data,
//   subject = subjectTypes.confirmEmail,
// }: {
//   data: emailData;
//   subject?: string;
// }) => {
//   const { id, email, userName } = data;

//   const codeOtp = generateOTPAlphabet(
//     Number(process.env.OTP_EXPIRES),
//     Number(process.env.OTP_LENGTH),
//   ); // valid for 10 minutes
//   const html = otpTemplateDesign(codeOtp.code, userName);

//   let updateData = {};

//   switch (subject as subjectTypes) {
//     case subjectTypes.confirmEmail:
//       updateData = {
//         // otp: generateHash(String(codeOtp.code)),
//         // otpExpires: codeOtp.otpExpires,
//         $push: {
//           OTP: {
//             code: generateHash(String(codeOtp.code)),
//             type: subjectTypes.confirmEmail,
//             expiresAt: codeOtp.otpExpires,
//           },
//         },
//       };
//       break;
//     case subjectTypes.resetPassword:
//       updateData = {
//         $push: {
//           OTP: {
//             code: generateHash(String(codeOtp.code)),
//             type: subjectTypes.resetPassword,
//             expiresAt: codeOtp.otpExpires,
//           },
//         },
//       };
//       break;
//     case subjectTypes.updateEmail:
//       updateData = {
//         // updatedEmailOtp: generateHash(String(codeOtp.code)),
//         // updatedEmailOtpExpires: codeOtp.otpExpires,
//         $push: {
//           OTP: {
//             code: generateHash(String(codeOtp.code)),
//             type: subjectTypes.updateEmail,
//             expiresAt: codeOtp.otpExpires,
//           },
//         },
//       };
//       break;
//     case subjectTypes.twoStepVerification:
//       updateData = {
//         // twoStepVerificationOtp: generateHash(String(codeOtp.code)),
//         // twoStepVerificationOtpExpires: codeOtp.otpExpires,
//         $push: {
//           OTP: {
//             code: generateHash(String(codeOtp.code)),
//             type: subjectTypes.twoStepVerification,
//             expiresAt: codeOtp.otpExpires,
//           },
//         },
//       };
//       break;
//     case subjectTypes.restoreAccount:
//       updateData = {
//         $push: {
//           OTP: {
//             code: generateHash(String(codeOtp.code)),
//             type: subjectTypes.restoreAccount,
//             expiresAt: codeOtp.otpExpires,
//           },
//         },
//       };
//       break;

//     default:
//       break;
//   }

//   //assign otp in user DB model

//   // console.log({updateData});

//   // send email
//   await sendEmail({
//     to: email,
//     subject,
//     html,
//   });
// };
