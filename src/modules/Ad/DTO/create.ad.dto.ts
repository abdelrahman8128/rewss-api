import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUrl,
  MaxLength,
  MinLength,
  IsMongoId,
} from "class-validator";
import { Transform } from "class-transformer";
export class CreateAdDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @MinLength(1)
  title: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  @MinLength(1)
  description: string;

  @IsNotEmpty()
  price: number;

  @IsNotEmpty()
  condition: string;

  @IsOptional()
  @IsMongoId({ each: true })
  @Transform(({ value }) => {
    if (!value) return undefined;
    return Array.isArray(value) ? value : [value];
  })
  model?: string[];

  @IsOptional()
  @IsString()
  manufacturedCountry?: string;
}
