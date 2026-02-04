// src/recipes/dto/create-recipe.dto.ts
import { IsNotEmpty, IsUrl } from 'class-validator';

export class CreateRecipeDto {
  @IsUrl()
  @IsNotEmpty()
  url: string;
}