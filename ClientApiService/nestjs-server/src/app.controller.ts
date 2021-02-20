import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { IsMobilePhone, IsNotEmpty, IsPhoneNumber } from 'class-validator';

class RegistrationDto {
  @IsNotEmpty()
  name: string;
  @IsMobilePhone('ru-RU')
  mobile: string;
  @IsNotEmpty()
  password: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/registration')
  registration(@Body() registrationDto: RegistrationDto): string {
    return registrationDto.name;
  }

  @Post('/authentication')
  authentication(): string {
    return 'poog';
  }

  @Post('/findTaxi')
  findTaxi(): string {
    return 'poog';
  }

  @Post('/applyOrder')
  applyOrder(): string {
    return 'poog';
  }

  @Post('/finishOrder')
  finishOrder(): string {
    return 'poog';
  }

  @Post('/getDriverPosition')
  getDriverPosition(): string {
    return 'poog';
  }
}
