import { Module } from '@nestjs/common';
import { MealPlannerService } from './meal-planner.service';
import { MealPlannerController } from './meal-planner.controller'; // Import prüfen
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [MealPlannerController], // <--- Steht er hier drin?
  providers: [MealPlannerService, PrismaService],
})
export class MealPlannerModule {}