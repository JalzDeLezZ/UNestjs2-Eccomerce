
import { applyDecorators, UseGuards } from '@nestjs/common';
import { IValidRoles } from '../interfaces';
import { RoleProtected } from './role-protected.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-role/user-role.guard';

export function MyAuth(...roles: IValidRoles[]) {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(AuthGuard(), UserRoleGuard)
  );
}

//? Reference: https://docs.nestjs.com/custom-decorators#decorator-composition