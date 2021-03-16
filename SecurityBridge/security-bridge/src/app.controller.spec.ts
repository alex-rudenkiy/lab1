/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AppModule } from './app.module';

describe('AppController', () => {
  let appController: AppController;
  let appNest: INestApplication;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
      imports: [AppModule],
    }).compile();

    appController = moduleRef.get<AppController>(AppController);
    appNest = moduleRef.createNestApplication();
    await appNest.init();

  });

  describe('root', () => {
    /*it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });*/
/*    it('/ (POST)', () => {
      return request(appNest.getHttpServer())
        .post('http://localhost:4006/passenger/login')
        .expect(201);
        //.expect('Hello World!');
    });*/

    it(`/POST cats`, () => {
      return request(appNest.getHttpServer())
        .post('/passenger/registration')
        .expect(201);
    });

  });


});

