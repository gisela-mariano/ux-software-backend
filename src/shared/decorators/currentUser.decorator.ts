import { AuthenticatedRequest, TokenBuffer } from "@modules/auth/interfaces/auth.interface";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TokenBuffer => {
    const request: AuthenticatedRequest = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
