import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUrl,
  MaxLength,
  MinLength,
  IsMongoId,
  IsNumber,
  IsDateString,
  Min,
  IsDefined,
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

  @IsDefined()
  @Transform(({ value }) => {
    if (!value) return undefined;
    // Handle both string and array formats from form data
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return [{ model: value, year: new Date().getFullYear() }];
      }
    }
    return Array.isArray(value) ? value : [value];
  })
  models?: Array<{ model: string; year: number }>;

  @IsDefined()
  @IsNotEmpty()
  @IsMongoId()
  category: string;

  @IsOptional()
  @IsString()
  manufacturedCountry?: string;

  @IsOptional()
  @IsMongoId({ each: true })
  @Transform(({ value }) => {
    if (!value) return undefined;
    return Array.isArray(value) ? value : [value];
  })
  album?: string[];

  // Stock-related fields
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  initialStock?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  warehouseSection?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumStockLevel?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumStockLevel?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitCost?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  supplier?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  batchNumber?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  stockNotes?: string;
}
