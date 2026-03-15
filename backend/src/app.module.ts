import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // <--- 1. Importieren
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecipesModule } from './recipes/recipes.module';
import { ScraperModule } from './scraper/scraper.module';
import { AiModule } from './ai/ai.module';
import { MealPlannerModule } from './mealPlanner/meal-planner.module';
import { CategoriesModule } from './categories/categories.module';
import { DailyRecipeModule } from './daily-recipe/daily-recipe.module';
import { SearchHistoryModule } from './search-history/search-history.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RecipesModule,
    ScraperModule,
    AiModule,
    MealPlannerModule,
    CategoriesModule,
    DailyRecipeModule,
    SearchHistoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}
