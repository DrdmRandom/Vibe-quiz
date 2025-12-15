import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class ChoiceDto {
  @IsString()
  text!: string;

  @IsBoolean()
  isCorrect!: boolean;
}

export class QuestionDto {
  @IsString()
  text!: string;

  @IsInt()
  @Min(5)
  durationSec!: number;

  @IsInt()
  order!: number;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => ChoiceDto)
  choices!: ChoiceDto[];
}

export class QuizDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsBoolean()
  isPublished!: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions!: QuestionDto[];
}
