import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { Transform } from "class-transformer";

export class UpdateUserDto {

    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    @Transform(({ value }) => value?.trim())
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
    @MaxLength(50, { message: 'El nombre no puede tener más de 50 caracteres' })
    name: string;

    @IsNotEmpty({ message: 'El apellido es obligatorio' })
    @Transform(({ value }) => value?.trim())
    @IsString({ message: 'El apellido debe ser una cadena de texto' })
    @MinLength(3, { message: 'El apellido debe tener al menos 3 caracteres' })
    @MaxLength(50, { message: 'El apellido no puede tener más de 50 caracteres' })
    lastname: string;

    @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
    @Transform(({ value }) => value?.trim())
    @IsString({ message: 'El nombre de usuario debe ser una cadena de texto' })
    @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
    @MaxLength(50, { message: 'El nombre de usuario no puede tener más de 50 caracteres' })
    username: string;

}