import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { MealPlannerService } from './meal-planner.service';
import { SaveWeekDto } from './dto/save-week.dto';

@Controller('meal-plans')
export class MealPlannerController {
  constructor(private readonly mealPlannerService: MealPlannerService) {}

  // Abrufen: GET /meal-planner?startDate=2023-10-01&endDate=2023-10-07
  @Get()
  async getPlan(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.mealPlannerService.getPlan(startDate, endDate);
  }

  @Get('all')
  async getAll() {
    return this.mealPlannerService.getAllUpcomingPlans();
  }

  @Post('week')
  async saveWeek(@Body() saveWeekDto: SaveWeekDto) {
    return this.mealPlannerService.saveWeek(saveWeekDto);
  }
}