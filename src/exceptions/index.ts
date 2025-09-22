import { AppException } from "@/exceptions/appException";
import { HttpStatus } from "@nestjs/common";

export class AlreadyRegisteredException extends AppException {
  constructor(message?: string) {
    super({
      message: message ?? "Face already registered",
      status: HttpStatus.BAD_REQUEST,
    });
  }
}
