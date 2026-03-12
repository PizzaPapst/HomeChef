import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ScraperService } from '../scraper/scraper.service';
import { normalizeIngredientName } from './ingredient-utils';

@Injectable()
export class RecipesService {
  private readonly logger = new Logger(RecipesService.name);

  constructor(
    private prisma: PrismaService,
    private scraperService: ScraperService,
  ) { }

  async findAll(category?: string) {
    const where: any = {};

    if (category) {
      const categoryNameMap = {
        quick: 'Schnell',
        vegetarian: 'Vegetarisch',
        'low-calorie': 'Kalorienarm',
        'high-protein': 'High Protein',
      };

      const targetName = categoryNameMap[category];
      if (targetName) {
        where.categories = { some: { name: targetName } };
      }
    }

    return (this.prisma as any).recipe.findMany({
      where,
      include: {
        ingredients: true,
        instructions: false,
        categories: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    } as any);
  }

  async analyzeRecipe(url: string) {
    return await this.scraperService.scrapeRecipe(url);
  }

  async create(data: CreateRecipeDto) {
    const recipe = await (this.prisma as any).recipe.create({
      data: {
        title: data.title,
        description: data.description || '',
        sourceUrl: data.sourceUrl,
        imageUrl: data.imageUrl,
        servings: data.servings,
        prepTime: data.prepTime,
        ingredients: {
          create: data.ingredients.map(ing => ({
            ...ing,
            normalizedName: ing.normalizedName || normalizeIngredientName(ing.name)
          })),
        },
        instructions: {
          create: data.instructions,
        },
        calories: data.calories,
      } as any,
    });

    await this.syncCategories(recipe.id);
    return this.findOne(recipe.id);
  }

  async findOne(id: number) {
    const recipe = await (this.prisma as any).recipe.findUnique({
      where: { id: id },
      include: {
        ingredients: true,
        categories: true,
        instructions: {
          orderBy: {
            step: 'asc',
          },
        },
      },
    } as any);

    if (!recipe) {
      throw new NotFoundException(`Rezept mit der ID ${id} nicht gefunden`);
    }

    return recipe;
  }

  async syncCategories(id: number) {
    const recipe = await (this.prisma as any).recipe.findUnique({
      where: { id },
      include: { categories: true },
    } as any);

    if (!recipe) return;

    const targetCategories: string[] = [];

    if (recipe.prepTime && recipe.prepTime <= 30) {
      targetCategories.push('Schnell');
    }

    await (this.prisma as any).recipe.update({
      where: { id },
      data: {
        categories: {
          set: [],
          connectOrCreate: targetCategories.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
    });
  }

  async update(id: number, updateRecipeDto: UpdateRecipeDto) {
    await (this.prisma as any).recipe.update({
      where: { id },
      data: {
        title: updateRecipeDto.title,
        sourceUrl: updateRecipeDto.sourceUrl,
        imageUrl: updateRecipeDto.imageUrl,
        servings: updateRecipeDto.servings,
        prepTime: updateRecipeDto.prepTime,

        ingredients: updateRecipeDto.ingredients
          ? {
            deleteMany: {},
            create: updateRecipeDto.ingredients.map((ing) => ({
              name: ing.name,
              normalizedName: normalizeIngredientName(ing.name),
              amount: ing.amount,
              unit: ing.unit,
            })),
          }
          : undefined,

        instructions: updateRecipeDto.instructions
          ? {
            deleteMany: {},
            create: updateRecipeDto.instructions.map((instr) => ({
              step: instr.step,
              text: instr.text,
            })),
          }
          : undefined,

        calories: updateRecipeDto.calories,
      } as any,
    });

    await this.syncCategories(id);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.prisma.recipe.delete({
      where: { id },
    });
  }

  async saveImage(id: number, buffer: Buffer, mimetype: string) {
    return (this.prisma as any).recipe.update({
      where: { id },
      data: {
        imageData: buffer,
        imageType: mimetype,
      } as any,
    });
  }
}
