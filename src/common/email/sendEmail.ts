import { createTransport, SendMailOptions, Transporter } from 'nodemailer';

import {
  BadGatewayException,
  InternalServerErrorException,
} from '@nestjs/common';

export const sendEmail = async (data: SendMailOptions): Promise<any> => {
  try {
    // ✅ Ensure `data` is properly typed
    if (!data.to && !data.cc && !data.bcc) {
      throw new BadGatewayException(' in-valid email address');
    }
    if (!data.html && !data.text && !data.attachments?.length) {
      throw new BadGatewayException(' in-valid email content');
    }
    // ✅ Create transporter
    const transporter: Transporter = createTransport({
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false, // Set to true for SSL/TLS
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_HOST,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    // async..await is not allowed in global scope, must use a wrapper
    // ✅ Send mail
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: `${process.env.EMAIL_NAMED_FROM} <${process.env.EMAIL_HOST}>`, // sender address
      ...data,
    });
    return info;
  } catch (error) {
    throw new InternalServerErrorException('Error in sending email');
  }
};
