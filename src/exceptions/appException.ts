import { HttpException, HttpStatus } from "@nestjs/common";

export interface AppExceptionProps {
  error: string;
  message: string;
  status: HttpStatus;
}

export class AppException extends HttpException {
  constructor({ error, message, status }: AppExceptionProps) {
    super(
      {
        error,
        message,
      },
      status,
    );
  }
}
