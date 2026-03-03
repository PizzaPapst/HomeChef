import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) { }

  @Get('analyze')
  async analyze(@Query('url') url: string) {
    return this.recipesService.analyzeRecipe(url);
  }

  @Post()
  async create(@Body() createRecipeDto: CreateRecipeDto) {
    return this.recipesService.create(createRecipeDto);
  }

  @Get()
  findAll(@Query('category') category?: string) {
    return this.recipesService.findAll(category);
  }

  @Get(':id')
  // ParseIntPipe wandelt "5" (String) automatisch in 5 (Number) um
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.recipesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRecipeDto: UpdateRecipeDto) {
    return this.recipesService.update(+id, updateRecipeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recipesService.remove(+id);
  }

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.recipesService.saveImage(id, file.buffer, file.mimetype);
  }

  @Get(':id/image')
  async getImage(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const recipe = await this.recipesService.findOne(id) as any;
    if (!recipe.imageData) {
      throw new NotFoundException('Kein Bild für dieses Rezept gefunden');
    }
    res.setHeader('Content-Type', recipe.imageType || 'image/jpeg');
    res.send(recipe.imageData);
  }
}
