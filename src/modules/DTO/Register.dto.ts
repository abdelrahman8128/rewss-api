import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  Matches,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsDate,
} from "class-validator";

export class registerDto {
  @IsString()
  public username: string;

  @IsNotEmpty()
  @IsString()
  public name: string;

  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @IsNotEmpty()
  @IsString()
  // @MinLength(8)
  // @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
  //     message: 'Password is too weak',
  // })
  public password: string;

  @IsOptional()
  @IsString()
  public phoneNumber?: string;

  @IsOptional()
  @IsString()
  public phoneCode?: string;

  @IsOptional()
  @IsBoolean()
  public isPhoneVerified?: boolean;

  @IsOptional()
  @IsEnum(["active", "inactive", "pending", "ban", "deleted", "blocked"])
  public status?: string;

  @IsOptional()
  @IsEnum(["user", "seller", "admin", "super"])
  public role?: string;

  @IsOptional()
  @IsDate()
  public createdAt?: Date;
}
