import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class AuthDto {

    @IsNotEmpty()
    @IsString()
    username: string;
    
    @IsNotEmpty()
    @IsString()
    password: string;
}   