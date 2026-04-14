import { IsBoolean, IsInt, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { Transform } from "class-transformer";

export class UpdateTaskDto {

    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    @Transform(({ value }) => value?.trim())
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
    @MaxLength(50, { message: 'El nombre debe tener un máximo de 50 caracteres' })
    name: string;

    @IsNotEmpty({ message: 'La descripción es obligatoria' })
    @Transform(({ value }) => value?.trim())
    @IsString({ message: 'La descripción debe ser una cadena de texto' })
    @MinLength(3, { message: 'La descripción debe tener al menos 3 caracteres' })
    @MaxLength(500, { message: 'La descripción debe tener un máximo de 500 caracteres' })
    description: string;

    @IsNotEmpty({ message: 'La prioridad es obligatoria' })
    @IsBoolean({ message: 'La prioridad debe ser un valor booleano' })
    priority: boolean;

}