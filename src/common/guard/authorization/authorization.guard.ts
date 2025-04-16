import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IAuthRequest } from '../authentication/authentication.guard';
import { RoleTypes, UserDocument } from 'src/DB/models/user.model';
import { rolesKey } from 'src/common/decorators/roles.decorators';
import { IClientAuthSocket } from 'src/modules/gateway/gateway';
@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requireRoles = this.reflector.getAllAndOverride<RoleTypes[]>(
      rolesKey,
      [context.getHandler(), context.getClass()],
    );
    let user: UserDocument;
    switch (context['contextType']) {
      case 'ws':
        user = context.switchToWs().getClient<IClientAuthSocket>().user;
        break;
      case 'http':
        user = context.switchToHttp().getRequest<IAuthRequest>().user;
        break;
      default:
        return false;
    }
    // user = context.switchToHttp().getRequest<IAuthRequest>().user;
    // if (!user) {
    //   throw new ForbiddenException('Unauthorized');
    // }
    // if (requireRoles && !requireRoles.includes(user.role)) {
    //   throw new ForbiddenException('Unauthorized to access this ACCOUNT');
    // }
    console.log({ user });

    if (!user || (requireRoles && !requireRoles.includes(user.role))) {
      // throw new ForbiddenException('Unauthorized to access this ACCOUNT');
      return false;
    }
    return true;
  }
}
