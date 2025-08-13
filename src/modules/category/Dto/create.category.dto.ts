import { IsNotEmpty, IsString, IsOptional, Length ,} from 'class-validator';

export class CreateCategoryDto {


    @IsString()
    @IsNotEmpty()

   name: string;

  
}