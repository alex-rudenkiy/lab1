import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { OrderService } from './database/entity/order/order.service';
import { UsersService } from './database/entity/user/users.service';
import { Order } from './database/entity/order/order.entity';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly orderService: OrderService,
    private readonly userService: UsersService,
  ) {}

  @Get()
  getHello(): Promise<Order> {
    const o = new Order();
    o.cost = 54;
    o.fromPosition = JSON.stringify({ x: 1, y: 2 });
    return this.userService
      .findOne(String(20))
      .then((value) => {
        o.passenger = value;
      })
      .then(() =>
        this.userService
          .findOne(String(26))
          .then((value) => (o.driver = value)),
      )
      .then(() => this.orderService.save(o));
  }
}
