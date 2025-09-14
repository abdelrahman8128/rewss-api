import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsArray,
  ArrayMaxSize,
} from "class-validator";
import { Transform } from "class-transformer";

// DTO usable for both regular users and sellers
// Your controller/service can ignore seller-only fields for non-seller roles
export class UpdateUsersDto {
  // Common user fields
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  phoneCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  avatar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  logo?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @Transform(({ value }) => {
    if (!value) return undefined;
    return Array.isArray(value) ? value : [value];
  })
  storePhoto?: string[];
}
