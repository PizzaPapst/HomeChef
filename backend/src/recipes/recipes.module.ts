import { Module } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ScraperModule } from 'src/scraper/scraper.module';

@Module({
  imports: [PrismaModule, ScraperModule],
  controllers: [RecipesController],
  providers: [RecipesService],
})
export class RecipesModule {}
