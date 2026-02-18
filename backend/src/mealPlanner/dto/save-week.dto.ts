// src/meal-planner/dto/save-week.dto.ts
import { IsDateString, IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

class DayPlanDto {
  @IsDateString()
  date: string; // z.B. "2023-11-15"

  @IsInt()
  recipeId: number;
}

export class SaveWeekDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayPlanDto)
  days: DayPlanDto[];
}
