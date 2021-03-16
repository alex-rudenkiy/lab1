import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Order } from './database/entity/order/order.entity';
import { OrderModule } from './database/entity/order/order.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './database/entity/user/users.module';
import { User } from './database/entity/user/user.entity';
import { OrderService } from './database/entity/order/order.service';
import { UsersService } from './database/entity/user/users.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',//dbpostgres
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      entities: [Order, User],
      synchronize: true,
    }),
    OrderModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, OrderService, UsersService],
})
export class AppModule {}
