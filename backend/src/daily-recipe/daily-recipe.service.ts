import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DailyRecipeService {
    constructor(private prisma: PrismaService) { }

    async getDailyRecipe() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if we already have one for today
        let daily = await this.prisma.dailyRecipe.findUnique({
            where: { date: today },
            include: { recipe: true },
        });

        if (!daily) {
            // Pick a random recipe
            const count = await this.prisma.recipe.count();
            if (count === 0) return null;

            const skip = Math.floor(Math.random() * count);
            const randomRecipe = await this.prisma.recipe.findMany({
                take: 1,
                skip: skip,
            });

            if (randomRecipe.length > 0) {
                daily = await this.prisma.dailyRecipe.upsert({
                    where: { date: today },
                    update: { recipeId: randomRecipe[0].id },
                    create: {
                        date: today,
                        recipeId: randomRecipe[0].id,
                    },
                    include: { recipe: true },
                });
            }
        }

        return daily?.recipe;
    }
}
