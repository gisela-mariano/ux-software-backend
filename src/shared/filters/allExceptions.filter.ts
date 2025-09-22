import { ApiResponse } from "@/shared/interfaces/apiResponse.interface";
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Response } from "express";

interface ErrorResponse {
  error: string;
  message: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let errors: string[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === "string") {
        message = res;
        errors = [res];
      } else if (typeof res === "object" && res !== null) {
        const r = res as ErrorResponse;

        message = r.error || r.message || message;

        if (Array.isArray(r.message)) {
          errors = r.message;
        } else {
          errors = [r.message || "Unknown error"];
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      errors = [exception.message];
    }

    const responseBody: ApiResponse<null> = {
      status,
      message,
      data: null,
      error: true,
      errors,
    };

    response.status(status).json(responseBody);
  }
}
