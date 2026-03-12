import { Module } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { AnalysisService } from './analysis.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ScraperModule } from 'src/scraper/scraper.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [PrismaModule, ScraperModule, AiModule],
  controllers: [RecipesController],
  providers: [RecipesService, AnalysisService],
})
export class RecipesModule {}
