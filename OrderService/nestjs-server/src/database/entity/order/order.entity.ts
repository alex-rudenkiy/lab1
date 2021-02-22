import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
  IsNull,
  ManyToMany,
  ManyToOne
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => User, (user) => user.id, { nullable: false })
  @JoinColumn()
  driver: User;

  @ManyToOne((type) => User, (user) => user.id, { nullable: false })
  @JoinColumn()
  passenger: User;

  @Column({ default: '{x:0,y:0}' })
  fromPosition: string;

  @Column({ default: '{x:0,y:0}' })
  toPosition: string;

  @Column()
  cost: number;

  @Column({ default: true })
  enabled: boolean;
}
