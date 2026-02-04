import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { AiModule } from '../ai/ai.module'; // Importieren

@Module({
  imports: [AiModule], // Hinzufügen
  providers: [ScraperService],
  exports: [ScraperService],
})
export class ScraperModule {}