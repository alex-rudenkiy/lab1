import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { IsMobilePhone, IsNotEmpty, IsPhoneNumber } from 'class-validator';
import axios from 'axios';
import { Console } from 'inspector';

class RegistrationDto {
  @IsNotEmpty()
  login: string;
  @IsNotEmpty()
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

class Point {
  x: number;
  y: number;
}

class FindTaxiDto {
  passengerID: number;
  fromPosition: Point;
  toPosition: Point;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/registration')
  registration(@Body() registrationDto: RegistrationDto): Promise<string> {
    return axios
      .post('http://localhost:4001/createUser', {
        ...registrationDto,
        ...{
          role: 'passenger',
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
        ...{ role: 'passenger' },
      })
      .then((v) => JSON.stringify(v.data));
  }

  @Post('/findTaxi')
  async findTaxi(@Body() findTaxiDto: FindTaxiDto): Promise<any> {
    const v = await axios.post('http://localhost:4002/getAllActualPositions');
    const c = await axios.post('http://localhost:4000/getCost', {
      ...{ fromPosition: findTaxiDto.fromPosition },
      ...{ toPosition: findTaxiDto.toPosition },
    });

    console.log({
      driverID: v.data[0].trackerID,
      passengerID: findTaxiDto.passengerID,
      cost: Math.round(c.data),
      ...{ fromPosition: findTaxiDto.fromPosition },
      ...{ toPosition: findTaxiDto.toPosition },
    });

    const result = (
      await axios.post('http://localhost:4004/createOrder', {
        driverID: v.data[0].trackerID,
        passengerID: findTaxiDto.passengerID,
        cost: Math.round(c.data),
        ...{ fromPosition: findTaxiDto.fromPosition },
        ...{ toPosition: findTaxiDto.toPosition },
      })
    ).data;

    result['driver'] = { ...result['driver'], ...v.data[0] };
    return result;

    /*    return axios
          .post('http://localhost:4002/getAllActualPositions')
          .then((v) => {
            return axios
              .post('http://localhost:4000/getCost', {
                ...{ fromPosition: findTaxiDto.fromPosition },
                ...{ toPosition: findTaxiDto.toPosition },
              })
              .then((c) => {
                return axios.post('http://localhost:4002/getAllActualPositions', {
                  driverID: v.data[0].trackerID,
                  passengerID: findTaxiDto.passengerID,
                  cost: c,
                  ...{ fromPosition: findTaxiDto.fromPosition },
                  ...{ toPosition: findTaxiDto.toPosition },
                });
              });
          });*/
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
