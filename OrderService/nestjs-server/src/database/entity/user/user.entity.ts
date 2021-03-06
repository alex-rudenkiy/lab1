import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  role: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  mobile: string;

  @Column({ nullable: false })
  password: string;

  @Column({ default: '' })
  payload: string;

  @Column({ default: true })
  enabled: boolean;
}
