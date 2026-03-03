import { Injectable, NotFoundException } from '@nestjs/common'; // NotFoundException importieren!
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ScraperService } from '../scraper/scraper.service';
import { normalizeIngredientName } from './ingredient-utils';
import { calculateTotalCalories } from './calorie-utils';

@Injectable()
export class RecipesService {
  constructor(
    private prisma: PrismaService,
    private scraperService: ScraperService, // <--- Hier injizieren wir den Scraper
  ) { }

  async findAll(category?: string) {
    const where: any = {};

    if (category) {
      // Map frontend category slugs to DB names
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

    return this.prisma.recipe.findMany({
      where,
      include: {
        ingredients: true,
        instructions: false,
        categories: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async analyzeRecipe(url: string) {
    // Ruft den Scraper, speichert aber NICHTS in der DB
    return await this.scraperService.scrapeRecipe(url);
  }

  async create(data: CreateRecipeDto) {
    // Nimmt das fertige DTO und schreibt es in die DB
    return this.prisma.recipe.create({
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
          create: data.instructions, // Passt auch direkt
        },
        calories: calculateTotalCalories(data.ingredients),
      },
    });

    await this.syncCategories(recipe.id);
    return this.findOne(recipe.id);
  }


  async findOne(id: number) {
    console.log(`[RecipesService] Searching for recipe with ID: ${id} (Type: ${typeof id})`);
    const recipe = await this.prisma.recipe.findUnique({
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
    });

    if (!recipe) {
      console.warn(`[RecipesService] Recipe with ID ${id} NOT found in database.`);
      throw new NotFoundException(`Rezept mit der ID ${id} nicht gefunden`);
    }

    console.log(`[RecipesService] Recipe found: ${recipe.title}`);
    return recipe;
  }

  async syncCategories(id: number) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: { categories: true },
    });

    if (!recipe) return;

    const targetCategories = [];

    // 1. "Schnell" logic
    if (recipe.prepTime && recipe.prepTime <= 30) {
      targetCategories.push('Schnell');
    }

    // Future logic (placeholder for user's requested categories)
    // if (isVegetarian(recipe)) targetCategories.push('Vegetarisch');
    // if (recipe.calories && recipe.calories <= 500) targetCategories.push('Kalorienarm');
    // ...

    // Update relations
    await this.prisma.recipe.update({
      where: { id },
      data: {
        categories: {
          set: [], // Clear old
          connectOrCreate: targetCategories.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
    });
  }

  async update(id: number, updateRecipeDto: UpdateRecipeDto) {
    return this.prisma.recipe.update({
      where: { id },
      data: {
        title: updateRecipeDto.title,
        sourceUrl: updateRecipeDto.sourceUrl,
        imageUrl: updateRecipeDto.imageUrl,
        servings: updateRecipeDto.servings,
        prepTime: updateRecipeDto.prepTime,

        // --- ZUTATEN ---
        // Prüfung: Sind Zutaten im Update enthalten?
        ingredients: updateRecipeDto.ingredients
          ? {
            deleteMany: {}, // 1. Alles löschen
            create: updateRecipeDto.ingredients.map((ing) => ({
              // 2. Neu anlegen
              name: ing.name,
              normalizedName: normalizeIngredientName(ing.name),
              amount: ing.amount,
              unit: ing.unit,
            })),
          }
          : undefined, // Wenn keine Zutaten im DTO -> Prisma ignoriert das Feld (ändert nichts)

        // --- ANLEITUNGEN ---
        // Gleiche Logik hier:
        instructions: updateRecipeDto.instructions
          ? {
            deleteMany: {},
            create: updateRecipeDto.instructions.map((instr) => ({
              step: instr.step,
              text: instr.text,
            })),
          }
          : undefined,

        calories: updateRecipeDto.ingredients
          ? calculateTotalCalories(updateRecipeDto.ingredients)
          : undefined,
      },
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
    return this.prisma.recipe.update({
      where: { id },
      data: {
        imageData: buffer,
        imageType: mimetype,
      },
    });
  }
}
