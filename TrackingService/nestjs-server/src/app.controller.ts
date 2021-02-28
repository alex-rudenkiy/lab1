import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { RedisService } from 'nestjs-redis';
import {ApiOperation, ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty} from "class-validator";

class Point {
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  @ApiProperty({ example: 120, nullable: false, required: true, type: Number, title: 'Значение координаты x' })
  x: number;
  @ApiProperty({ example: 535, nullable: false, required: true, type: Number, title: 'Значение координаты y' })
  y: number;
}

class SetPositionDto {
  @IsNotEmpty()
  @ApiProperty({ example: 2, nullable: false, required: true, type: Number, title: 'Уникальный идентификатор трекера' })
  trackerID: number;
  @IsNotEmpty()
  @ApiProperty({ example: new Point(5, 3), nullable: false, required: true, type: Point, title: 'Позиция трекера' })
  position: Point;
}

class GetPositionDto {
  @IsNotEmpty()
  @ApiProperty({ example: 2, nullable: false, required: true, type: Number, title: 'Уникальный идентификатор трекера' })
  trackerID: number;
}

@Controller()
export class AppController {
  client = this.redisService.getClient();

  constructor(
    private readonly appService: AppService,
    private readonly redisService: RedisService,
  ) {}

  @Get('getCurrentTime')
  @ApiOperation({ summary: 'Получить текущее серверное время' })
  getCurrentTime(): any {
    const now = new Date();
    console.log(now);
    return now;
  }

  @Post('/setPosition')
  @ApiOperation({ summary: 'Установить текущую позицию устройства с заданным ID' })
  setPosition(@Body() setPositionDto: SetPositionDto): string {
    console.log(
      JSON.stringify({
        ...setPositionDto.position,
        ...{ updatedAt: new Date() },
      }),
    );
    this.client.set(
      String(setPositionDto.trackerID),
      JSON.stringify({
        ...setPositionDto.position,
        ...{ updatedAt: new Date() },
      }),
    );

    return 'ok';
  }

  @Post('/getPosition')
  @ApiOperation({ summary: 'Получить текущую позицию устройства с заданным ID' })
  getPosition(@Body() getPositionDto: GetPositionDto): Promise<string | null> {
    return this.client
      .get(String(getPositionDto.trackerID))
      .then((value) => JSON.parse(value));
  }

  @Post('/getAllActualPositions')
  @ApiOperation({ summary: 'Получить акутальный id и местоположение какого нибудь устройства.', description: 'Актуальность определяется тем, что любое устройство которое обновляло своё местоположение раньше чем 50000 секунд назад, то оно является активным!' })
  async getAllActualPositions(): Promise<any> {
    const result = [];
    //await this.client.del('123');
    const data = await this.client.keys('*');
    //console.log(data);
    for (const k in data) {
      const t = await this.client.get(String(data[k]));

      if (Math.abs((new Date().getTime() - new Date(JSON.parse(t).updatedAt).getTime()) / 1000) < 50000) {
        result.push({ trackerID: Number(data[k]), ...JSON.parse(t) });
      }
    }

    //console.log(result);
    return result;
  }

  @Get('/flushall')
  @ApiOperation({ summary: 'Очистить базу данных' })
  flushall(): any{
    return this.client.flushall();
  }
}
