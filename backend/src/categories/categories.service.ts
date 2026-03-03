import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService implements OnModuleInit {
    constructor(private prisma: PrismaService) { }

    async onModuleInit() {
        await this.seedCategories();
    }

    private async seedCategories() {
        const categories = ['Schnell', 'Kalorienarm', 'High Protein', 'Vegetarisch'];
        for (const name of categories) {
            try {
                await (this.prisma as any).category.upsert({
                    where: { name },
                    update: {},
                    create: { name },
                });
            } catch (error) {
                console.error(`Error seeding category ${name}:`, error.message);
            }
        }
    }

    findAll() {
        return (this.prisma as any).category.findMany();
    }

    async findOne(id: number) {
        return (this.prisma as any).category.findUnique({
            where: { id },
            include: { recipes: true },
        });
    }
}
