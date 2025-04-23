import { Reflector } from '@nestjs/core';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log('UserRoleGuard executed');
    const validRoles: string[] = this.reflector.get(
      'roles',
      context.getHandler(),
    );

    console.log({ validRoles });
    if (!validRoles && validRoles.length === 0) {
      return true; // No roles defined, allow access
    }

    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    if (!user) {
      throw new Error('User not found in request');
    }
    console.log({ userRoles: user.roles });

    for (const role of user.roles) {
      if (validRoles.includes(role)) {
        return true;
      }
    }
    throw new ForbiddenException(
      `User ${
        user.fullName
      } does not have the required roles: ${validRoles.join(', ')}`,
    );
  }
}
