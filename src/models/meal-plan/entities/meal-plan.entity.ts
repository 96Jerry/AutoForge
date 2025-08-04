import { RestaurantName } from 'src/crawl/enums/restaurant-name.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('meal_plan')
export class MealPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  date: string;

  @Column({ type: 'varchar', length: 500, array: true })
  imagePaths: string[];

  @Column({ type: 'enum', enum: RestaurantName })
  restaurantName: RestaurantName;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
