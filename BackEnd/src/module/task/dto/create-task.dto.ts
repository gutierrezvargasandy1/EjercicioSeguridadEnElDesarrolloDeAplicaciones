import { IsBoolean, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { Transform } from "class-transformer";

export class CreateTaskDto {

    @Transform(({ value }) => value?.trim())
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    @MinLength(3 ,{ message: 'El nombre no debe tener menos de 3 caracteres'}) 
    @MaxLength(50, { message: 'El nombre no debe tener más de 50 caracteres'}) 
    name: string;

    @Transform(({ value }) => value?.trim())
    @IsNotEmpty({ message: 'La descripción es obligatoria' })
    @IsString({ message: 'La descripción debe ser una cadena de texto' })
    @MinLength(3, { message: 'La descripción no debe tener menos de 3 caracteres'}) 
    @MaxLength(500, { message: 'La descripción no debe tener más de 500 caracteres'}) 
    description: string;

    @IsNotEmpty()
    @IsBoolean()
    priority: boolean;
}