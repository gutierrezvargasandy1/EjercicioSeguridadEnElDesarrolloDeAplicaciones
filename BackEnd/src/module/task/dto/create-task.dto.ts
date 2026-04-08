import { IsBoolean, IsInt, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator"

export class CreateTaskDto {

    @IsNotEmpty({ message: 'El nombre es Obligatorio'})
    @MinLength(3 ,{ message: 'El nombre no tiene que tener menos de 3 caracteres'}) 
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    @MaxLength(50, { message: 'El nombre no tiene que tener mas de 50 caracteres'}) 
    name: string 

    @IsNotEmpty({ message: 'La descripción es Obligatorio'})
    @IsString({ message: 'La descripción debe ser una cadena de texto' })
    @MinLength(3, { message: 'La descripción no tiene que tener menos de 3 caracteres'}) 
    @MaxLength(500, { message: 'La descripción no tiene que tener mas de 500 caracteres'}) 
    description: string

    @IsNotEmpty()
    @IsBoolean()
    priority: boolean  
    

}
