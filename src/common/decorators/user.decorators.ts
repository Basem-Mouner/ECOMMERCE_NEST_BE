import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDocument } from 'src/DB/models/user.model';
import { IAuthRequest } from '../guard/authentication/authentication.guard';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserDocument => {
    const request = ctx.switchToHttp().getRequest<IAuthRequest>(); // ✅ Explicitly type request
    return request.user as UserDocument; // ✅ Type assertion to avoid TypeScript error
  },
);
