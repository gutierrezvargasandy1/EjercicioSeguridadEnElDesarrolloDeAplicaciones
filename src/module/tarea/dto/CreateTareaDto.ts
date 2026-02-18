import { IsString, IsNotEmpty, MaxLength, IsInt, Min } from 'class-validator';

export class CreateTareaDto {

    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    name: string;

    @IsString()
    @MaxLength(500)
    description: string;

    @IsInt()
    @Min(1)
    priority: number;

    @IsInt()
    user_id: number;
}
