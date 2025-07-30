import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealPlan } from './entities/meal-plan.entity';
import { MealPlanService } from './meal-plan.service';

@Module({
  imports: [TypeOrmModule.forFeature([MealPlan])],
  providers: [MealPlanService],
  exports: [MealPlanService],
})
export class MealPlanModule {}
