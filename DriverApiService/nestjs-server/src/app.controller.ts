import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { IsMobilePhone, IsNotEmpty, IsPhoneNumber } from 'class-validator';
import axios from 'axios';

class RegistrationDto {
  @IsNotEmpty()
  login: string;
  @IsMobilePhone('ru-RU')
  mobile: string;
  @IsNotEmpty()
  password: string;
}

class AuthenticationDto {
  @IsMobilePhone('ru-RU')
  mobile: string;
  @IsNotEmpty()
  password: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/registration')
  registration(@Body() registrationDto: RegistrationDto): Promise<string> {
    return axios
      .post('http://localhost:4001/createUser', {
        ...registrationDto,
        ...{ role: 'passenger' },
      })
      .then((v) => JSON.stringify(v.data));
  }

  @Post('/authentication')
  authentication(
    @Body() authenticationDto: AuthenticationDto,
  ): Promise<string> {
    return axios
      .post('http://localhost:4001/findUserByLoginPassword', {
        ...authenticationDto,
        ...{ role: 'driver' },
      })
      .then((v) => JSON.stringify(v.data));
  }
}
