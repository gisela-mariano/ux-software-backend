import { AuthenticatedRequest } from "@/modules/auth/interfaces/auth.interface";
import { UserRole } from "@modules/users/dtos/user.dto";
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "@shared/decorators/roles.decorator";

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user }: AuthenticatedRequest = context.switchToHttp().getRequest();

    const hasRole = requiredRoles.some((role) => user.roles.includes(role));

    if (!hasRole)
      throw new ForbiddenException("You do not have permission to access this resource");

    return true;
  }
}
