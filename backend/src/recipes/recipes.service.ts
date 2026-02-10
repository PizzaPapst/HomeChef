import { Injectable, NotFoundException } from '@nestjs/common'; // NotFoundException importieren!
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

  async analyzeRecipe(url: string) {
    // Ruft den Scraper, speichert aber NICHTS in der DB
    return await this.scraperService.scrapeRecipe(url);
  }

  async create(data: CreateRecipeDto) {
    // Nimmt das fertige DTO und schreibt es in die DB
    return this.prisma.recipe.create({
      data: {
        title: data.title,
        sourceUrl: data.sourceUrl,
        imageUrl: data.imageUrl,
        servings: data.servings,
        prepTime: data.prepTime,
        ingredients: {
          create: data.ingredients, // Passt direkt, da Struktur identisch
        },
        instructions: {
          create: data.instructions, // Passt auch direkt
        },
      },
    });
  }

  findAll() {
    return this.prisma.recipe.findMany({
      include: { ingredients: false, instructions: false } // Lade auch die Details
    });
  }

  async findOne(id: number) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: id },
      include: {
        ingredients: true, // Lädt die Zutaten mit
        instructions: {
          orderBy: {
            step: 'asc', // WICHTIG: Sortiert die Schritte (1, 2, 3...)
          },
        },
      },
    });

    // Sicherheit: Falls ID 999 aufgerufen wird, die es nicht gibt
    if (!recipe) {
      throw new NotFoundException(`Rezept mit der ID ${id} nicht gefunden`);
    }

    return recipe;
  }

  update(id: number, updateRecipeDto: UpdateRecipeDto) {
    return `This action updates a #${id} recipe`;
  }

  remove(id: number) {
    return `This action removes a #${id} recipe`;
  }
}
