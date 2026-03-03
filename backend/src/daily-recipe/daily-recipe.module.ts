import { Module } from '@nestjs/common';
import { DailyRecipeService } from './daily-recipe.service';
import { DailyRecipeController } from './daily-recipe.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [DailyRecipeController],
    providers: [DailyRecipeService],
    exports: [DailyRecipeService],
})
export class DailyRecipeModule { }
