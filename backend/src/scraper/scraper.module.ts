import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { SocialMediaService } from './social-media.service';
import { WhisperService } from './whisper.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  providers: [ScraperService, SocialMediaService, WhisperService],
  exports: [ScraperService],
})
export class ScraperModule { }
