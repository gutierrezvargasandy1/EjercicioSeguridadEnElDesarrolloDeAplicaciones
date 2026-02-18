import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateUserDto {

    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    name: string;

    @IsString()
    @MaxLength(400)
    lastname: string;
}
