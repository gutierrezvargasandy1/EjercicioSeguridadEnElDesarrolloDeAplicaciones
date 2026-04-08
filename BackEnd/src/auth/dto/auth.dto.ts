import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class AuthDto {

    @IsNotEmpty({ message: 'El nombre de usuario es obligatorio'})
    @IsString({ message: 'El nombre del usuario tiene que ser una cadena de texto'})
    @MaxLength(50, { message: 'El nombre de usuario no puede tener más de 50 caracteres' })
    username: string;
    
    @IsNotEmpty({ message: 'La contraseña es obligatoria'})
    @IsString({ message: 'La contraseña debe ser una cadena de texto'})
    @MaxLength(100, { message: 'La contraseña no puede tener más de 100 caracteres' })
    password: string;
}   