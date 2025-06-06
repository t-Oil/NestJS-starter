import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { headers } = context.switchToHttp().getRequest();

    const userPermissions: string[] = this.getPermissions(headers?.user);

    return requiredRoles.some((role) => userPermissions?.includes(role));
  }

  private getPermissions(user: any): string[] {
    if (!user) return [];

    try {
      return user?.roles.flatMap((role: { permissions: any[] }) =>
        role.permissions.map((permission) => permission.value),
      );
    } catch (error) {
      return [];
    }
  }
}
