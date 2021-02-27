import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  UseFilters,
} from '@nestjs/common';
import { AppService } from './app.service';
import { IsMobilePhone, IsNotEmpty, IsPhoneNumber } from 'class-validator';
import axios from 'axios';
import { ApiOperation, ApiProperty } from '@nestjs/swagger';

class RegistrationDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'Ivan', nullable: false, type: String })
  name: string;
  @IsMobilePhone('ru-RU')
  @ApiProperty({ example: '880005553535', nullable: false, type: String })
  mobile: string;
  @IsNotEmpty()
  @ApiProperty({ example: 'qwerty', nullable: false, type: String })
  password: string;
  @IsNotEmpty()
  @ApiProperty({ example: 'с065мк78', nullable: false, type: String })
  licensePlate: string;
}

class AuthenticationDto {
  @IsMobilePhone('ru-RU')
  @ApiProperty({ example: '880005553535', nullable: false, type: String })
  mobile: string;
  @IsNotEmpty()
  @ApiProperty({ example: 'qwerty', nullable: false, type: String })
  password: string;
}

class GetOrderByDriverIDDto {
  @IsNotEmpty()
  @ApiProperty({ example: 7, nullable: false, type: Number })
  driverID: number;
}

class FinishOrderDto {
  @IsNotEmpty()
  @ApiProperty({ example: 7, nullable: false, type: Number })
  driverId: number;
}

class Point {
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  @ApiProperty({ example: 120, nullable: false, type: Number })
  x: number;
  @ApiProperty({ example: 535, nullable: false, type: Number })
  y: number;
}

class updatePositionDto {
  @IsNotEmpty()
  @ApiProperty({ example: 7, nullable: false, type: Number })
  trackerID: number;
  @IsNotEmpty()
  @ApiProperty({ example: new Point(5, 3), nullable: false, type: Point })
  position: Point;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/registration')
  @ApiOperation({
    summary:
      'Регистрация нового аккаунта водителя по мобильному номеру, логину и паролю',
  })
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
  @ApiOperation({
    summary: 'Авторизация водителя по мобильному номеру и паролю',
  })
  async authentication(
      @Body() authenticationDto: AuthenticationDto,
  ): Promise<string> {
    let result = (await axios
        .post('http://localhost:4001/findUserByPhonePasswordRole', {
          ...authenticationDto,
          ...{role: 'driver'},
        })).data;

    if(result.length==0){
      throw new HttpException('Ошибка при вводе мобильного номера или пароля!', HttpStatus.CONFLICT);
    }

    return JSON.stringify(result);
  }

  async checkDriverExistInDataBase(id: number): Promise<boolean> {
    return (
      (await axios.post('http://localhost:4001/findDriverByID', { id: id })).data[
        'id'
      ] == id
    );
  }

  @Post('/getActualOrderByDriverID')
  @ApiOperation({ summary: 'Получить текущий заказ' })
  async getOrderByDriverID(
    @Body() getOrderByDriverIDDto: GetOrderByDriverIDDto,
  ): Promise<string> {
    if ((await this.checkDriverExistInDataBase(getOrderByDriverIDDto.driverID)) == false)
      throw new HttpException('Водитель с таким ID не найден!', HttpStatus.CONFLICT);


    return axios
      .post(
        'http://localhost:4004/findActualOrderByDriverID',
        getOrderByDriverIDDto,
      )
      .then((v) => JSON.stringify(v.data));
  }

  @Post('/updatePosition')
  @ApiOperation({ summary: 'Обновить свою геолокацию и поисковую активность' })
  async updatePosition(
      @Body() updatePositionDto: updatePositionDto,
  ): Promise<string> {
    if ((await this.checkDriverExistInDataBase(updatePositionDto.trackerID)) == false)
      throw new HttpException('Водитель с таким ID не найден!', HttpStatus.CONFLICT);


    return axios
        .post(
            'http://localhost:4002/setPosition',
            {
              trackerID: updatePositionDto.trackerID,
              position: updatePositionDto.position
            },
        )
        .then((v) => JSON.stringify(v.data));
  }

  @Post('/finishOrder')
  @ApiOperation({ summary: 'Завершить текущий заказ' })
  async finishOrder(
    @Body() finishOrderDto: FinishOrderDto,
  ): Promise<string> {
    if ((await this.checkDriverExistInDataBase(finishOrderDto.driverId)) == false)
      throw new HttpException('Водитель с таким ID не найден!', HttpStatus.CONFLICT);

    //console.log(finishOrderDto);

    const findedOrder = (
      await axios.post('http://localhost:4004/findOrderByParams', {
        driver: finishOrderDto.driverId,
        enabled: true,
      })
    ).data;

/*
    console.log(findedOrder);
    console.log(findedOrder['id']);
*/

    let result;
    try{
    result = JSON.stringify(
        (
            await axios.post('http://localhost:4004/disableOrderByID', {
              orderID: findedOrder['id'],
            })
        ).data,
    )} catch {
      throw new HttpException('Актуальных поездок нет, поэтому завершать нечего!', HttpStatus.CONFLICT);
    }

    return result;
  }
}
