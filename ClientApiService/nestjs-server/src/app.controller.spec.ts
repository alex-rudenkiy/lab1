import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {IsMobilePhone, IsNotEmpty} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', async () => {
      let data ={
        name: "Ivan",
        mobile: "880005553535",
        password: "qwerty"
      }

      expect(await appController.registration(data)).toContain('"name":"Ivan"');
    });
  });
});
