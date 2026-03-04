import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateUserDto {

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    name?: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    lastname?: string;

    @IsOptional()
    @IsString()
    @MinLength(4)
    @MaxLength(30)
    username?: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    @MaxLength(100)
    password?: string;
}