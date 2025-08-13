import { IsNotEmpty, IsString, IsOptional, Length ,IsDefined } from 'class-validator';

export class CreateCategoryDto {


    @IsDefined()
    @IsNotEmpty()
    @IsString()
    name: string;

   @IsOptional()
   @IsString()
   @Length(0, 500)
   description?: string;

}