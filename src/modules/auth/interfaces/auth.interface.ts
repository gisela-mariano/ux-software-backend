import { UserRole } from "@/modules/users/dtos/user.dto";

export interface TokenBuffer {
  sub: string;
  email: string;
  roles: UserRole[];
}

export class AuthenticatedRequest extends Request {
  user: TokenBuffer;
}
