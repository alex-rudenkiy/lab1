import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { IsMobilePhone, IsNotEmpty, IsPhoneNumber } from 'class-validator';
import axios from 'axios';

class RegistrationDto {
  @IsNotEmpty()
  name: string;
  @IsMobilePhone('ru-RU')
  mobile: string;
  @IsNotEmpty()
  password: string;
  @IsNotEmpty()
  licensePlate: string;
}

class AuthenticationDto {
  @IsMobilePhone('ru-RU')
  mobile: string;
  @IsNotEmpty()
  password: string;
}

class GetOrderByDriverIDDto {
  @IsNotEmpty()
  driverID: number;
}

class finishOrderByIDDto {
  @IsNotEmpty()
  orderID: number;
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
        ...{
          role: 'driver',
          payload: JSON.stringify({
            licensePlate: registrationDto.licensePlate,
          }),
        },
      })
      .then((v) => JSON.stringify(v.data));
  }

  @Post('/authentication')
  authentication(
    @Body() authenticationDto: AuthenticationDto,
  ): Promise<string> {
    return axios
      .post('http://localhost:4001/findUserByPhonePassword', {
        ...authenticationDto,
        ...{ role: 'driver' },
      })
      .then((v) => JSON.stringify(v.data));
  }

  @Post('/getActualOrderByDriverID')
  getOrderByDriverID(
    @Body() getOrderByDriverIDDto: GetOrderByDriverIDDto,
  ): Promise<string> {
    console.log(getOrderByDriverIDDto);
    return axios
      .post(
        'http://localhost:4004/findActualOrderByDriverID',
        getOrderByDriverIDDto,
      )
      .then((v) => JSON.stringify(v.data));
  }

  @Post('/finishOrderByID')
  finishOrderByID(
    @Body() finishOrderByIDDto: finishOrderByIDDto,
  ): Promise<string> {
    return axios
      .post('http://localhost:4004/disableOrderByID', finishOrderByIDDto)
      .then((v) => JSON.stringify(v.data));
  }
}
