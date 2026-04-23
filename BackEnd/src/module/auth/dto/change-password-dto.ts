import { IsNotEmpty, IsString, MinLength, MaxLength } from "class-validator";

export class ChangePasswordDto {

    @IsNotEmpty({ message: 'La contraseña actual es obligatoria' })
    @IsString({ message: 'La contraseña actual debe ser una cadena de texto' })
    @MinLength(6, { message: 'La contraseña actual debe tener al menos 6 caracteres' })
    @MaxLength(100, { message: 'La contraseña actual no puede tener más de 100 caracteres' })
    currentPassword: string;

    @IsNotEmpty({ message: 'La nueva contraseña es obligatoria' })
    @IsString({ message: 'La nueva contraseña debe ser una cadena de texto' })
    @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
    @MaxLength(100, { message: 'La nueva contraseña no puede tener más de 100 caracteres' })
    newPassword: string;
}