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
  @IsNotEmpty()
  @IsString()
  public name: string;

  @IsOptional()
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


}
