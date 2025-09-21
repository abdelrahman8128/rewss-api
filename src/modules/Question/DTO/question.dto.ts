import {
  IsDefined,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateQuestionDto {
  @IsDefined({ message: "content is required" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content!: string;
}

export class EditQuestionDto {
  @IsDefined({ message: "content is required" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content!: string;
}

export class AnswerQuestionDto {
  @IsDefined({ message: "content is required" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content!: string;
}

export class EditAnswerDto {
  @IsDefined({ message: "content is required" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content!: string;
}
