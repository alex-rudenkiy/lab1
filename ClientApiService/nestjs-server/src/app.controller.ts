import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { IsMobilePhone, IsNotEmpty, IsPhoneNumber } from 'class-validator';
import axios from 'axios';
import { Console } from 'inspector';

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
    // Make a request for a user with a given ID
    console.log(JSON.stringify(registrationDto));
    axios
      .post('http://localhost:4001/createUser', registrationDto)
      .then(function (response) {
        // handle success
        //console.log(response);
      })
      .catch(function (error) {
        // handle error
        //console.log(error);
      })
      .then(function () {
        // always executed
      });

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
