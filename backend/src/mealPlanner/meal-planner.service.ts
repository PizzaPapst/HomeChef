import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveWeekDto } from './dto/save-week.dto';

@Injectable()
export class MealPlannerService {
  constructor(private prisma: PrismaService) {}

  // 1. Plan abrufen (GET)
  async getPlan(startDate: string, endDate: string) {
    // Auch hier sicherstellen, dass wir den ganzen Tag erwischen
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return this.prisma.mealPlan.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        recipe: true,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  // 2. Plan speichern (POST)
  async saveWeek(dto: SaveWeekDto) {
    // A. Datums-Grenzen sauber berechnen
    const start = new Date(dto.startDate);
    start.setHours(0, 0, 0, 0); // Startet am Anfang des ersten Tages

    const end = new Date(dto.endDate);
    end.setHours(23, 59, 59, 999); // Endet am Ende des letzten Tages!

    // B. Daten bereinigen (Uhrzeit immer auf 00:00 setzen)
    // Das verhindert Chaos mit Zeitzonen oder krummen Uhrzeiten
    const cleanDays = dto.days.map((day) => {
      const d = new Date(day.date);
      d.setHours(0, 0, 0, 0); // Uhrzeit entfernen -> 00:00:00
      return {
        date: d,
        recipeId: day.recipeId,
      };
    });

    return this.prisma.$transaction([
      // Schritt A: Den Zeitraum KOMPLETT säubern
      this.prisma.mealPlan.deleteMany({
        where: {
          date: {
            gte: start,
            lte: end, // Jetzt wird auch ein Eintrag um 18:00 Uhr gelöscht
          },
        },
      }),

      // Schritt B: Die neuen, sauberen Tage eintragen
      this.prisma.mealPlan.createMany({
        data: cleanDays,
        skipDuplicates: true, // Sicherheitsnetz: Falls doppelte Tage im Array sind, ignoriere den zweiten
      }),
    ]);
  }

  // Hol einfach alles, was ab heute geplant ist, sortiert nach Datum
  async getAllUpcomingPlans() {
    return this.prisma.mealPlan.findMany({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // Ab heute 00:00 Uhr
        },
      },
      include: {
        recipe: true,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }
}
