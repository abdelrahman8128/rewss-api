import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
  MaxLength,
} from "class-validator";

export class StockDto {
  // Stock quantities
  @IsOptional()
  @IsNumber()
  @Min(0)
  availableQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  reservedQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  soldQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrderQuantity?: number;

  // For adjust operations (alternative field names)
  @IsOptional()
  @IsNumber()
  @Min(0)
  available?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  reserved?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bought?: number;

  // For quantity-based operations (reserve, buy, etc.)
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  // Status and metadata
  @IsOptional()
  @IsString()
  status?: 'available' | 'out_of_stock' | 'low_stock';

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
  notes?: string;

  // Common fields for all operations
  @IsOptional()
  @IsString()
  @MaxLength(100)
  orderId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  reason?: string;
}
