import { 
  IsBoolean, 
  IsOptional, 
  IsString, 
  MaxLength, 
  MinLength 
} from "class-validator";

export class UpdateTareaDto {

   @IsOptional()
   @IsString({ message: "El name debe ser una cadena de texto" })
   @MinLength(3, { message: "El name debe tener mínimo 3 caracteres" })
   @MaxLength(100, { message: "El name no puede superar los 100 caracteres" })
   name?: string;
   
   @IsOptional()
   @IsString({ message: "El Description debe ser una cadena de texto" })
   @MinLength(5, { message: "La Description debe tener al menos 5 caracteres" })
   @MaxLength(250, { message: "La Description no puede superar los 250 caracteres" })
   Description?: string;
   
   @IsOptional()
   @IsBoolean({ message: "El priority debe ser verdadero o falso" })
   priority?: boolean;

}