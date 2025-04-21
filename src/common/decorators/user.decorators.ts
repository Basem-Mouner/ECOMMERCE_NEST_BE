import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDocument } from 'src/DB/models/user.model';
import { IAuthRequest } from '../guard/authentication/authentication.guard';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IClientAuthSocket } from 'src/modules/gateway/gateway';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserDocument => {
    let user: UserDocument = {} as UserDocument;
    switch (ctx['contextType']) {
      case 'ws':
        user = ctx.switchToWs().getClient<IClientAuthSocket>().user;
        break;
      case 'http':
        user = ctx.switchToHttp().getRequest<IAuthRequest>().user;
        break;
      case 'graphql':
        user = GqlExecutionContext.create(ctx).getContext<{
          req: IAuthRequest;
        }>().req.user;
        break;
      default:
        break;
    }
    // const request =
    //   ctx.switchToHttp().getRequest<IAuthRequest>() ||
    //   GqlExecutionContext.create(ctx).getContext<{
    //     req: IAuthRequest;
    //   }>().req; // ✅ Explicitly type request
    return user; // ✅ Type assertion to avoid TypeScript error
  },
);
