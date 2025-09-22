import { ApiResponse } from "@/shared/interfaces/apiResponse.interface";
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";

interface ControllerReturn<T> {
  data?: T;
  message?: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const httpContext = context.switchToHttp();
    const response: { statusCode: number } = httpContext.getResponse();
    const statusCode: number = response.statusCode;

    return next.handle().pipe(
      map((result: unknown) => {
        const controllerReturn: ControllerReturn<T> =
          result && typeof result === "object" && ("data" in result || "message" in result)
            ? (result as ControllerReturn<T>)
            : { data: result as ControllerReturn<T>["data"] };

        return {
          status: statusCode,
          message: controllerReturn.message ?? "Success",
          data: controllerReturn.data ?? null,
          error: false,
          errors: null,
        };
      }),
    );
  }
}
