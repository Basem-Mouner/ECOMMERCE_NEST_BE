import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { RoleTypes, UserDocument } from 'src/DB/models/user.model';
import { UserRepositoryService } from 'src/DB/repository/user.repository.service';

export enum TokenType {
  access = 'access',
  refresh = 'refresh',
}
export enum BearerTypes {
  Bearer = 'Bearer',
  System = 'System',
}

export interface ITokenPayload extends JwtPayload {
  id: Types.ObjectId;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly userRepositoryService: UserRepositoryService,
    private readonly jwt: JwtService,
  ) {}

  sign({
    role = RoleTypes.user,
    type = TokenType.access,
    payload,
    expiresIn = parseInt(process.env.ACCESS_TOKEN_EXPIRESIN as string),
  }: {
    role?: RoleTypes;
    type?: TokenType;
    payload: ITokenPayload;
    expiresIn?: number;
  }) {
    const { accessSignature, refreshSignature } = this.getSignature(role);

    const token = this.jwt.sign(payload, {
      secret: type === TokenType.access ? accessSignature : refreshSignature,
      expiresIn:
        type === TokenType.access
          ? expiresIn
          : parseInt(process.env.REFRESH_TOKEN_EXPIRESIN as string),
    });
    return token;
  }
  private getSignature(role: RoleTypes): {
    accessSignature: string;
    refreshSignature: string;
  } {
    let accessSignature: string;
    let refreshSignature: string;

    switch (role) {
      case RoleTypes.admin:
        accessSignature = process.env.TOKEN_SIGNATURE_Admin as string;
        refreshSignature = process.env.TOKEN_REFRESH_SIGNATURE_Admin as string;
        break;
      default:
        accessSignature = process.env.TOKEN_SIGNATURE_User as string;
        refreshSignature = process.env.TOKEN_REFRESH_SIGNATURE_User as string;
        break;
    }

    return { accessSignature, refreshSignature };
  }

  async signAsync({
    payload,
    secret = process.env.TOKEN_SIGNATURE_User,
    expiresIn = parseInt(process.env.ACCESS_TOKEN_EXPIRESIN as string),
  }: {
    payload: ITokenPayload;
    secret?: string;
    expiresIn?: number;
  }) {
    return await this.jwt.signAsync(payload, { secret, expiresIn });
  }
  //verify token 🚀
  async verify({
    authorization,
    type = TokenType.access,
  }: {
    authorization: string;
    type?: TokenType;
  }): Promise<UserDocument> {
    try {
      // if (!authorization) {
      //   throw new BadRequestException('Missing token');
      // }
      const [Bearer, token] = authorization.split(' ') || [];
      if (!Bearer || !token) {
        throw new BadRequestException('Missing token');
      }
      const { accessSignature, refreshSignature } = this.getSignature(
        Bearer === (BearerTypes.System as string)
          ? RoleTypes.admin
          : RoleTypes.user,
      );

      const decoded: ITokenPayload = this.jwt.verify(token, {
        secret: type === TokenType.access ? accessSignature : refreshSignature,
      });
      // console.log({ decoded });

      if (!decoded?.id) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const user = await this.userRepositoryService.findOne({
        filter: { _id: decoded.id },
      });

      if (!user) {
        throw new NotFoundException('Not registered account');
      }
      if (user.changeCredentialsTime?.getTime() >= (decoded.iat ?? 0) * 1000) {
        throw new BadRequestException('Expired login Credentials');
      }

      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
