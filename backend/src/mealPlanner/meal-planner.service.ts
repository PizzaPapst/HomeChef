import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveWeekDto } from './dto/save-week.dto';

@Injectable()
export class MealPlannerService {
  constructor(private prisma: PrismaService) {}

  // 1. Plan abrufen (GET)
  async getPlan(startDate: string, endDate: string) {
    return this.prisma.mealPlan.findMany({
      where: {
        date: {
          gte: new Date(startDate), // Größer gleich Start
          lte: new Date(endDate),   // Kleiner gleich Ende
        },
      },
      include: {
        recipe: true, // Damit wir Titel & Bild im Frontend haben
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  // 2. Plan speichern (POST)
  async saveWeek(dto: SaveWeekDto) {
    // Prisma Transaction: Alles oder nichts
    return this.prisma.$transaction([
      
      // Schritt A: Erstmal den Zeitraum "säubern". 
      // Das löscht alte Einträge und auch Einträge an Tagen, die im neuen Plan leer sind.
      this.prisma.mealPlan.deleteMany({
        where: {
          date: {
            gte: new Date(dto.startDate),
            lte: new Date(dto.endDate),
          },
        },
      }),

      // Schritt B: Die neuen Tage eintragen
      this.prisma.mealPlan.createMany({
        data: dto.days.map((day) => ({
          date: new Date(day.date),
          recipeId: day.recipeId,
        })),
      }),
    ]);
  }
}