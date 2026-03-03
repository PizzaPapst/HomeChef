// src/recipes/dto/create-recipe.dto.ts
import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// Hilfs-Klasse für Zutaten
export class IngredientDto {
  @IsString()
  name: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsString()
  @IsOptional()
  normalizedName?: string;
}

// Hilfs-Klasse für Schritte
export class InstructionDto {
  @IsNumber()
  step: number;

  @IsString()
  text: string;
}

// Das Haupt-Paket
export class CreateRecipeDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  sourceUrl: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  @IsOptional()
  servings?: number;

  @IsNumber()
  @IsOptional()
  prepTime?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IngredientDto)
  ingredients: IngredientDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InstructionDto)
  instructions: InstructionDto[];
}
