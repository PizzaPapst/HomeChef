import { Controller, Get, Post, Body, Delete } from '@nestjs/common';
import { SearchHistoryService } from './search-history.service';

@Controller('search-history')
export class SearchHistoryController {
    constructor(private readonly searchHistoryService: SearchHistoryService) { }

    @Get()
    async getRecentSearches() {
        return this.searchHistoryService.getRecentSearches();
    }

    @Post()
    async saveSearch(
        @Body('term') term: string,
        @Body('filterCount') filterCount: number,
        @Body('filters') filters: any,
    ) {
        return this.searchHistoryService.saveSearch(term, filterCount, filters);
    }

    @Delete()
    async deleteSearch(
        @Body('term') term: string,
        @Body('filterCount') filterCount: number,
        @Body('filters') filters: any,
    ) {
        return this.searchHistoryService.deleteSearch(term, filterCount, filters);
    }
}
