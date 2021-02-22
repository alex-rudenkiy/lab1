import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { RedisService } from 'nestjs-redis';

class Point {
  x: number;
  y: number;
}

class SetPositionDto {
  trackerID: number;
  position: Point;
}

class GetPositionDto {
  trackerID: number;
}

@Controller()
export class AppController {
  client = this.redisService.getClient();

  constructor(
    private readonly appService: AppService,
    private readonly redisService: RedisService,
  ) {}

  @Get('hello')
  hello(): any {
    const now = new Date();
    console.log(now);
    return now;
  }

  @Post('/setPosition')
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
  getPosition(@Body() getPositionDto: GetPositionDto): Promise<string | null> {
    return this.client
      .get(String(getPositionDto.trackerID))
      .then((value) => JSON.parse(value));
  }

  @Post('/getAllActualPositions')
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
  flushall(): any{
    return this.client.flushall();
  }
}
