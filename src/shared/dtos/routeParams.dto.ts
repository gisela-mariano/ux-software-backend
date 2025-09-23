import { DefaultPagination } from "@/shared/interfaces/routeParams.interface";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, Min } from "class-validator";

export class PaginationDTO {
  @ApiPropertyOptional({ description: "Number of items to return", type: Number })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = DefaultPagination.LIMIT;

  @ApiPropertyOptional({ description: "Page number to return", type: Number })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  page?: number = DefaultPagination.PAGE;
}
