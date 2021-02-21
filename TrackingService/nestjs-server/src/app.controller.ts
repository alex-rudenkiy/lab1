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
      JSON.stringify(
        JSON.stringify({
          ...setPositionDto.position,
          ...{ updatedAt: new Date() },
        }),
      ),
    );

    return 'ok';
  }

  @Post('/getPosition')
  getPosition(@Body() getPositionDto: GetPositionDto): Promise<string | null> {
    return this.client
      .get(String(getPositionDto.trackerID))
      .then((value) => JSON.parse(value));
  }
}
