import { Injectable } from '@nestjs/common';
import { RedisService } from 'nestjs-redis';

@Injectable()
export class AppService {
  constructor(private readonly redisService: RedisService) {}
  getHello(): string {
    //console.log(this.redisService.getClients());
    const client = this.redisService.getClient();
    client.get('1').then((v) => console.log(v));
    client.set('1', 'xzw').then(() => client.get('1').then((v) => console.log(v)));

    return 'Hello World!';
  }
}
