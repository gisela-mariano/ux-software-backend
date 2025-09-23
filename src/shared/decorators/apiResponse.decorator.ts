import { applyDecorators, Type } from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiResponse,
  getSchemaPath,
} from "@nestjs/swagger";

interface BaseResponseSchemaOptions {
  status: number;
}

function baseResponseSchema(model: Type<unknown>, options?: BaseResponseSchemaOptions) {
  return {
    type: "object",
    properties: {
      status: { type: "number", example: options?.status ?? 200 },
      message: { type: "string", example: "Success" },
      data: { $ref: getSchemaPath(model) },
      error: { type: "boolean", example: false },
      errors: {
        type: "array",
        items: { type: "string" },
        nullable: true,
        example: null,
      },
    },
  };
}

export const ApiOkResponseWrapped = <TModel extends Type<unknown>>(model: TModel) =>
  applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      schema: baseResponseSchema(model),
    }),
  );

export const ApiCreatedResponseWrapped = <TModel extends Type<unknown>>(model: TModel) =>
  applyDecorators(
    ApiExtraModels(model),
    ApiCreatedResponse({
      schema: baseResponseSchema(model, { status: 201 }),
    }),
  );

export const ApiSuccessResponseWrapped = <TModel extends Type<unknown>>(model: TModel) =>
  applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      schema: baseResponseSchema(model),
    }),
  );
