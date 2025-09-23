import { applyDecorators, Type } from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiResponse,
  getSchemaPath,
} from "@nestjs/swagger";

type ModelOrArray = Type<unknown> | [Type<unknown>];

interface BaseResponseSchemaOptions {
  status: number;
}

function buildDataSchema(modelOrArray: ModelOrArray) {
  if (Array.isArray(modelOrArray)) {
    const [itemModel] = modelOrArray;
    return {
      type: "array",
      items: { $ref: getSchemaPath(itemModel) },
    };
  }

  if (modelOrArray === Boolean) {
    return { type: "boolean" };
  }

  return { $ref: getSchemaPath(modelOrArray) };
}

function collectExtraModels(modelOrArray: ModelOrArray): Type<unknown>[] {
  return Array.isArray(modelOrArray) ? [modelOrArray[0]] : [modelOrArray];
}

function baseResponseSchema(modelOrArray: ModelOrArray, options?: BaseResponseSchemaOptions) {
  return {
    type: "object",
    properties: {
      status: { type: "number", example: options?.status ?? 200 },
      message: { type: "string", example: "Success" },
      data: buildDataSchema(modelOrArray),
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

export const ApiOkResponseWrapped = (modelOrArray: ModelOrArray) =>
  applyDecorators(
    ApiExtraModels(...collectExtraModels(modelOrArray)),
    ApiOkResponse({
      schema: baseResponseSchema(modelOrArray),
    }),
  );

export const ApiCreatedResponseWrapped = (modelOrArray: ModelOrArray) =>
  applyDecorators(
    ApiExtraModels(...collectExtraModels(modelOrArray)),
    ApiCreatedResponse({
      schema: baseResponseSchema(modelOrArray, { status: 201 }),
    }),
  );

export const ApiSuccessResponseWrapped = (modelOrArray: ModelOrArray) =>
  applyDecorators(
    ApiExtraModels(...collectExtraModels(modelOrArray)),
    ApiResponse({
      schema: baseResponseSchema(modelOrArray),
    }),
  );
