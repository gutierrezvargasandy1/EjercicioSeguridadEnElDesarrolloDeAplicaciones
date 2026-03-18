import { IsBoolean, IsInt, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator"

export class CreateTaskDto {

    @IsNotEmpty()
    @IsString()
    @MinLength(3) 
    @MaxLength(50) 
    name: string 

    @IsNotEmpty()
    @IsString()
    @MinLength(3) 
    @MaxLength(500) 
    description: string

    @IsNotEmpty()
    @IsBoolean()
    priority: boolean  
    
    @IsNotEmpty()
    @IsInt()
    user_id: number
}
