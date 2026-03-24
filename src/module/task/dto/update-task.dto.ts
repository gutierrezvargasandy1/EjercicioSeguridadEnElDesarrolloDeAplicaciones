import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateTaskDto {

    @IsOptional()
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
    @MaxLength(50, { message: 'El nombre debe tener un máximo de 50 caracteres' })
    name?: string

    @IsOptional()
    @IsString({ message: 'La descripción debe ser una cadena de texto' })
    @MinLength(3, { message: 'La descripción debe tener al menos 3 caracteres' })
    @MaxLength(500, { message: 'La descripción debe tener un máximo de 500 caracteres' })
    description?: string

    @IsOptional()
    @IsBoolean({ message: 'La prioridad debe ser un valor booleano' })
    priority?: boolean

    @IsOptional()
    @IsInt({ message: 'El ID de usuario debe ser un número entero' })
    user_id?: number

}