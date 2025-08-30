import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsNotEmpty,
  IsMongoId,
} from "class-validator";

export class BanUserDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(365)
  banDays: number;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UnbanUserDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}
