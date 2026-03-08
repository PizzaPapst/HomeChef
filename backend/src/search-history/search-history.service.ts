import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchHistoryService {
    constructor(private prisma: PrismaService) { }

    async getRecentSearches() {
        return this.prisma.searchHistory.findMany({
            orderBy: { createdAt: 'desc' },
            take: 6,
        });
    }

    async saveSearch(term: string, filterCount: number, filters: any) {
        // Check if an identical search exists
        const existingSearch = await this.prisma.searchHistory.findFirst({
            where: {
                term,
                filterCount,
            },
        });

        let match = existingSearch;
        // Simple filter comparison if existing found
        if (existingSearch && JSON.stringify(existingSearch.filters) !== JSON.stringify(filters)) {
            match = null;
        }

        if (match) {
            // Update existing
            await this.prisma.searchHistory.update({
                where: { id: match.id },
                data: { createdAt: new Date() },
            });
        } else {
            // Create new
            await this.prisma.searchHistory.create({
                data: {
                    term,
                    filterCount,
                    filters,
                },
            });
        }

        // Keep only the last 6
        const allSearches = await this.prisma.searchHistory.findMany({
            orderBy: { createdAt: 'desc' },
        });

        if (allSearches.length > 6) {
            const searchesToDelete = allSearches.slice(6);
            const idsToDelete = searchesToDelete.map((s) => s.id);
            await this.prisma.searchHistory.deleteMany({
                where: { id: { in: idsToDelete } },
            });
        }
    async deleteSearch(term: string, filterCount: number, filters: any) {
            // Find the exact match
            const searches = await this.prisma.searchHistory.findMany({
                where: { term, filterCount },
            });

            for (const search of searches) {
                if (JSON.stringify(search.filters) === JSON.stringify(filters)) {
                    await this.prisma.searchHistory.delete({
                        where: { id: search.id },
                    });
                    break; // Delete only one match
                }
            }
        }
    }
