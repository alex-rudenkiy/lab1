import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from 'nestjs-redis';

@Module({
  imports: [
    RedisModule.register({
      url: 'redis://localhost:6379/4',//dbredis
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
