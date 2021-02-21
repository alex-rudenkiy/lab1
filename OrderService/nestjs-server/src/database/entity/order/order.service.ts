/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  findAll(): Promise<Order[]> {
    return this.orderRepository.find();
  }

  findOne(id: string): Promise<Order> {
    return this.orderRepository.findOne(id);
  }

  save(user: Order) {
    return this.orderRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    await this.orderRepository.delete(id);
  }
}