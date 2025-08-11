import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUrl,
  MaxLength,
  isString,
  MinLength,
} from "class-validator";

export class CreateBrandDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @MinLength(1)
  name: string;

  //   @IsOptional()
  //   @IsString()
  //   logoUrl?: string;
}
