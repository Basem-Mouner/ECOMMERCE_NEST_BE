import { applyDecorators, UseGuards } from '@nestjs/common';

import { AuthenticationGuard } from '../guard/authentication/authentication.guard';
import { AuthorizationGuard } from '../guard/authorization/authorization.guard';

import { Roles } from './roles.decorators';
import { RoleTypes } from 'src/DB/models/user.model';

export function Auth(roles: RoleTypes[]) {
  return applyDecorators(
    Roles(roles),
    UseGuards(AuthenticationGuard, AuthorizationGuard),
  );
}
