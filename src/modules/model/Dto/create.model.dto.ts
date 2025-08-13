import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUrl,
  MaxLength,
  isString,
  MinLength,
  IsMongoId,
} from "class-validator";

export class CreateModelDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @MinLength(1)
  name: string;

    @IsNotEmpty()
    @IsMongoId()
    brand: string; // Brand ID should be a valid MongoDB ObjectId

 
}
