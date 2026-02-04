import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // <--- 1. Importieren
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecipesModule } from './recipes/recipes.module';
import { ScraperModule } from './scraper/scraper.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [RecipesModule, ScraperModule, AiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
