import { Injectable } from '@nestjs/common';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ScraperService } from '../scraper/scraper.service';

@Injectable()
export class RecipesService {
  constructor(
    private prisma: PrismaService,
    private scraperService: ScraperService, // <--- Hier injizieren wir den Scraper
  ) {}

  async create(createRecipeDto: CreateRecipeDto) {
    // 1. Daten von der URL scrapen
    console.log(`Starte Scraping für: ${createRecipeDto.url}`);
    const scrapedData = await this.scraperService.scrapeRecipe(createRecipeDto.url);

    // 2. In der Datenbank speichern
    // Prisma ist sehr mächtig: Wir können Zutaten & Schritte in einem Rutsch speichern ("Nested Writes")
    return this.prisma.recipe.create({
      data: {
        title: scrapedData.title,
        sourceUrl: createRecipeDto.url, // Wir nehmen die URL aus dem DTO, die ist sicher
        imageUrl: scrapedData.imageUrl,
        servings: scrapedData.servings,
        prepTime: scrapedData.prepTime,
        
        // Relationen anlegen
        ingredients: {
          create: scrapedData.ingredients, // Das Array passt direkt, da wir es im Scraper passend geformt haben
        },
        instructions: {
          create: scrapedData.instructions,
        },
      },
    });
  }

  findAll() {
    return this.prisma.recipe.findMany({
      include: { ingredients: true, instructions: true } // Lade auch die Details
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} recipe`;
  }

  update(id: number, updateRecipeDto: UpdateRecipeDto) {
    return `This action updates a #${id} recipe`;
  }

  remove(id: number) {
    return `This action removes a #${id} recipe`;
  }
}
