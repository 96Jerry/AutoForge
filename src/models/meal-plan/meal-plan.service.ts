import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MealPlan } from './entities/meal-plan.entity';
import { RestaurantName } from 'src/crawl/enums/restaurant-name.enum';
import * as dayjs from 'dayjs';

@Injectable()
export class MealPlanService {
  constructor(
    @InjectRepository(MealPlan)
    private readonly mealPlanRepository: Repository<MealPlan>,
  ) {}

  async create(mealPlanData: Partial<MealPlan>): Promise<MealPlan> {
    const mealPlan = this.mealPlanRepository.create(mealPlanData);
    return await this.mealPlanRepository.save(mealPlan);
  }

  async findAll(): Promise<MealPlan[]> {
    return await this.mealPlanRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByDate(date: string): Promise<MealPlan[]> {
    return await this.mealPlanRepository.find({
      where: { date },
      order: { createdAt: 'DESC' },
    });
  }

  async findByDateAndRestaurant(
    date: string,
    restaurantName: RestaurantName,
  ): Promise<MealPlan | null> {
    return await this.mealPlanRepository.findOne({
      where: { date, restaurantName },
      order: { createdAt: 'DESC' },
    });
  }

  async findTodaysMeals(): Promise<MealPlan[]> {
    const now = new Date();
    const date = dayjs(now).format('YYYY-MM-DD');

    return await this.mealPlanRepository.find({
      where: { date },
      order: { createdAt: 'DESC' },
    });
  }

  async findTodaysMealsByRestaurant(
    restaurantName: RestaurantName,
  ): Promise<MealPlan | null> {
    const now = new Date();
    const date = dayjs(now).format('YYYY-MM-DD');

    return await this.mealPlanRepository.findOne({
      where: { date, restaurantName },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<MealPlan | null> {
    return await this.mealPlanRepository.findOne({ where: { id } });
  }

  async delete(id: number): Promise<void> {
    await this.mealPlanRepository.delete(id);
  }

  async findRecent(limit: number = 10): Promise<MealPlan[]> {
    return await this.mealPlanRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /** 중복 식단표 확인 (같은 날짜, 같은 식당) */
  async isDuplicate(
    date: string,
    restaurantName: RestaurantName,
  ): Promise<boolean> {
    const existing = await this.findByDateAndRestaurant(date, restaurantName);
    return !!existing;
  }

  /** 식당별 식단표 조회 */
  async findByRestaurant(
    restaurantName: RestaurantName,
    limit: number = 10,
  ): Promise<MealPlan[]> {
    return await this.mealPlanRepository.find({
      where: { restaurantName },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
