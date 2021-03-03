import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { OrderService } from './database/entity/order/order.service';
import { UsersService } from './database/entity/user/users.service';
import { Order } from './database/entity/order/order.entity';
import {ApiOperation} from "@nestjs/swagger";

class Point {
  x: number;
  y: number;
}

class CreateOrderDto {
  driverID: number;
  passengerID: number;
  fromPosition: Point;
  toPosition: Point;
  cost: number;
}

class EnableOrderByIDDto {
  orderID: number;
}

class DisableOrderByIDDto {
  orderID: number;
}

class FindOrderByDriverIDDto {
  driverID: number;
}

class FindOrderByPassengerIDDto {
  passengerID: number;
}

class FindActualOrderByIDDto {
  orderID: number;
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly orderService: OrderService,
    private readonly userService: UsersService,
  ) {}

  @Post('/createOrder')
  async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    const o = new Order();
    o.cost = createOrderDto.cost;
    o.fromPosition = JSON.stringify(createOrderDto.fromPosition);
    o.toPosition = JSON.stringify(createOrderDto.toPosition);

    o.passenger = await this.userService.findOne(
      String(createOrderDto.passengerID),
    );
    console.log(createOrderDto.driverID);

    o.driver = await this.userService.findOne(String(createOrderDto.driverID));

    const result = await this.orderService.save(o);

    return {
      ...result,
      ...{
        fromPosition: JSON.parse(result.fromPosition),
        toPosition: JSON.parse(result.toPosition),
      },
    };

    /*return this.userService
        .findOne(String(createOrderDto.passengerID))
        .then((value) => {
          o.passenger = value;
        })
        .then(() =>
            this.userService
                .findOne(String(createOrderDto.driverID))
                .then((value) => (o.driver = value)),
        )
        .then(() => this.orderService.save(o))
        .then((value) => {
          return {
            ...value,
            ...{
              fromPosition: JSON.parse(value.fromPosition),
              toPosition: JSON.parse(value.toPosition),
            },
          };
        });*/
  }

  @Post('/enableOrderByID')
  enableOrderByID(
    @Body() enableOrderByIDDto: EnableOrderByIDDto,
  ): Promise<Order> {
    return this.orderService
      .findOne(String(enableOrderByIDDto.orderID))
      .then((o) => {
        o['enabled'] = true;
        return this.orderService.save(o).then((value) => {
          return {
            ...value,
            ...{
              fromPosition: JSON.parse(value.fromPosition),
              toPosition: JSON.parse(value.toPosition),
            },
          };
        });
      });
  }

  @Post('/disableOrderByID')
  disableOrderByID(
    @Body() disableOrderByIDDto: DisableOrderByIDDto,
  ): Promise<Order> {
    console.log(disableOrderByIDDto);
    return this.orderService
      .findOne(String(disableOrderByIDDto.orderID))
      .then((o) => {
        o['enabled'] = false;
        return this.orderService.save(o).then((value) => {
          return value;
        });
      });
  }

  @Post('/findActualOrderByDriverID')
  findOrderByDriverID(
    @Body() findOrderByDriverIDDto: FindOrderByDriverIDDto,
  ): Promise<Order[]> {
    return this.orderService.find({
      driver: String(findOrderByDriverIDDto.driverID),
      enabled: true,
    });
  }

  @Post('/findOrderByParams')
  async findOrderByParams(@Body() params): Promise<Order> {
    return (await this.orderService.find({ where: params, relations: ['passenger', 'driver'] })).pop();
  }

  @Post('/findOrderByPassengerID')
  findOrderByPassengerID(
    @Body() findOrderByPassengerIDDto: FindOrderByPassengerIDDto,
  ): Promise<Order[]> {
    return this.orderService.find({
      driver: String(findOrderByPassengerIDDto.passengerID),
      enabled: true,
    });
  }
}
