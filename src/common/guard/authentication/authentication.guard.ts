import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { TokenService } from 'src/common/security/service/token.service';
import { UserDocument } from 'src/DB/models/user.model';
import { IClientAuthSocket } from 'src/modules/gateway/gateway';

export interface IAuthRequest extends Request {
  user: UserDocument; // Use a specific type instead of `any` if possible (e.g., `UserDocument`)
}

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    let authorization: string | undefined = undefined;

    switch (context['contextType']) {
      case 'ws':
        authorization =
          context.switchToWs().getClient<IClientAuthSocket>().handshake?.auth
            ?.authorization ||
          context.switchToWs().getClient<IClientAuthSocket>().handshake?.headers
            ?.authorization;
        context.switchToWs().getClient<IClientAuthSocket>().user =
          await this.tokenService.verify({
            authorization: authorization as string,
          });
        break;
      case 'http':
        authorization = context.switchToHttp().getRequest<Request>()
          .headers.authorization;
        if (!authorization) {
          throw new UnauthorizedException('Authorization header missing');
        }
        context.switchToHttp().getRequest<IAuthRequest>().user =
          await this.tokenService.verify({ authorization });
        break;

      default:
        break;
    }

    // const { authorization } = context
    //   .switchToHttp()
    //   .getRequest<Request>().headers;
    // if (!authorization) {
    //   throw new UnauthorizedException('Authorization header missing');
    // }
    // // console.log(authorization);
    // context.switchToHttp().getRequest<IAuthRequest>().user =
    //   await this.tokenService.verify({ authorization });
    // // console.log({
    // //   gUser: context.switchToHttp().getRequest<IAuthRequest>().user,
    // // });
    if (!authorization) {
      throw new UnauthorizedException('Authorization header missing');
    }

    return true;
  }
}
