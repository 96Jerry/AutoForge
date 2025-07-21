import {
  Controller,
  Get,
  Param,
  Delete,
  Query,
  Put,
  Body,
} from '@nestjs/common';
import { MealPlanService } from './meal-plan.service';
import { MealPlan } from './entities/meal-plan.entity';

@Controller('meal-plans')
export class MealPlanController {
  constructor(private readonly mealPlanService: MealPlanService) {}

  @Get()
  async findAll(): Promise<MealPlan[]> {
    return await this.mealPlanService.findAll();
  }

  @Get('current')
  async findCurrentWeek(): Promise<MealPlan | null> {
    return await this.mealPlanService.findCurrentWeek();
  }

  @Get('recent')
  async findRecent(@Query('limit') limit?: string): Promise<MealPlan[]> {
    const limitNum = limit ? parseInt(limit) : 10;
    return await this.mealPlanService.findRecent(limitNum);
  }

  @Get('analyzed')
  async findAnalyzed(): Promise<MealPlan[]> {
    return await this.mealPlanService.findAnalyzed();
  }

  @Get('unanalyzed')
  async findUnanalyzed(): Promise<MealPlan[]> {
    return await this.mealPlanService.findUnanalyzed();
  }

  @Get('statistics')
  async getStatistics() {
    return await this.mealPlanService.getStatistics();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<MealPlan | null> {
    return await this.mealPlanService.findById(parseInt(id));
  }

  @Put(':id/menu-data')
  async updateMenuData(
    @Param('id') id: string,
    @Body() body: { menuData: any },
  ): Promise<MealPlan> {
    return await this.mealPlanService.updateMenuData(
      parseInt(id),
      body.menuData,
    );
  }

  @Put(':id/description')
  async updateDescription(
    @Param('id') id: string,
    @Body() body: { description: string },
  ): Promise<MealPlan> {
    return await this.mealPlanService.updateDescription(
      parseInt(id),
      body.description,
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.mealPlanService.delete(parseInt(id));
    return { message: '식단표가 삭제되었습니다.' };
  }
}
