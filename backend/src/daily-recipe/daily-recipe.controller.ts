import { Controller, Get } from '@nestjs/common';
import { DailyRecipeService } from './daily-recipe.service';

@Controller('daily-recipe')
export class DailyRecipeController {
    constructor(private readonly dailyRecipeService: DailyRecipeService) { }

    @Get()
    getDailyRecipe() {
        return this.dailyRecipeService.getDailyRecipe();
    }
}
