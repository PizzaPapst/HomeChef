import { Module } from '@nestjs/common';
import { AiService } from './ai.service';

@Module({
  providers: [AiService],
  exports: [AiService], // WICHTIG: Exportieren für den Scraper
})
export class AiModule {}