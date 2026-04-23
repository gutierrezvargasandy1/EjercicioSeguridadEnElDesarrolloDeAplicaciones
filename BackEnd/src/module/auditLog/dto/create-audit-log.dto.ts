import { IsNotEmpty, IsOptional, IsString, IsInt } from "class-validator";

export class CreateAuditLogDto {

  @IsNotEmpty()
  @IsInt()
  userId: number;

  @IsNotEmpty()
  @IsString()
  action: string;

  @IsNotEmpty()
  @IsString()
  entity: string;

  @IsOptional()
  @IsInt()
  entityId?: number;

  @IsOptional()
  oldValue?: any;

  @IsOptional()
  newValue?: any;

  @IsOptional()
  @IsString()
  ip?: string;
}