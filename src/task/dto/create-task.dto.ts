import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator"

export class CreateTaskDto {

    @IsNotEmpty()
    @IsString()
    @MinLength(3) 
    @MaxLength(50) 
    name: string 

    @IsOptional()
    @IsString()
    @MinLength(3) 
    @MaxLength(500) 
    description?: string

    @IsOptional()
    @IsBoolean()
    priority?: boolean  
    
    @IsNotEmpty()
    @IsInt()
    user_id: number
}