import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { MealPlan } from './entities/meal-plan.entity';

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

  async findByWeek(
    weekStartDate: Date,
    weekEndDate: Date,
  ): Promise<MealPlan | null> {
    return await this.mealPlanRepository.findOne({
      where: {
        weekStartDate,
        weekEndDate,
      },
    });
  }

  async findCurrentWeek(): Promise<MealPlan | null> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // 일요일
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // 토요일
    endOfWeek.setHours(23, 59, 59, 999);

    return await this.mealPlanRepository.findOne({
      where: {
        weekStartDate: Between(startOfWeek, endOfWeek),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async updateMenuData(id: number, menuData: any): Promise<MealPlan> {
    await this.mealPlanRepository.update(id, {
      menuData,
      isAnalyzed: true,
    });
    return await this.mealPlanRepository.findOne({ where: { id } });
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

  /** 분석이 완료된 식단표 조회 */
  async findAnalyzed(): Promise<MealPlan[]> {
    return await this.mealPlanRepository.find({
      where: { isAnalyzed: true },
      order: { createdAt: 'DESC' },
    });
  }

  /** 분석이 미완료된 식단표 조회 */
  async findUnanalyzed(): Promise<MealPlan[]> {
    return await this.mealPlanRepository.find({
      where: { isAnalyzed: false },
      order: { createdAt: 'DESC' },
    });
  }

  /** 식단표 설명 업데이트 */
  async updateDescription(id: number, description: string): Promise<MealPlan> {
    await this.mealPlanRepository.update(id, { description });
    return await this.mealPlanRepository.findOne({ where: { id } });
  }

  /** 중복 식단표 확인 (같은 주차) */
  async isDuplicate(weekStartDate: Date, weekEndDate: Date): Promise<boolean> {
    const existing = await this.findByWeek(weekStartDate, weekEndDate);
    return !!existing;
  }

  /** 식단표 통계 */
  async getStatistics() {
    const total = await this.mealPlanRepository.count();
    const analyzed = await this.mealPlanRepository.count({
      where: { isAnalyzed: true },
    });
    const unanalyzed = total - analyzed;

    return {
      total,
      analyzed,
      unanalyzed,
      analysisRate: total > 0 ? Math.round((analyzed / total) * 100) : 0,
    };
  }
}
