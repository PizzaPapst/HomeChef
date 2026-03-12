import { Test, TestingModule } from '@nestjs/testing';
import { ScraperService } from './scraper.service';
import { AiService } from '../ai/ai.service';
import { SocialMediaService } from './social-media.service';

describe('ScraperService', () => {
  let service: ScraperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScraperService,
        {
          provide: AiService,
          useValue: {
            categorizeIngredients: jest.fn(),
            parseRecipeFromHtml: jest.fn(),
            parseRecipeFromSocialMedia: jest.fn(),
          },
        },
        {
          provide: SocialMediaService,
          useValue: {
            downloadAndProcess: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ScraperService>(ScraperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
