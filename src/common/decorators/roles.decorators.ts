import { SetMetadata } from '@nestjs/common';
import { RoleTypes } from 'src/DB/models/user.model';

export const rolesKey: string = 'roles';

export const Roles = (data: RoleTypes[]) => {
  return SetMetadata(rolesKey, data);
};
