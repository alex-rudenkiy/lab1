import {Body, Controller, Get, HttpException, HttpStatus, Post} from '@nestjs/common';
import { AppService } from './app.service';
import { IsMobilePhone, IsNotEmpty, IsPhoneNumber } from 'class-validator';
import axios from 'axios';
import { Console } from 'inspector';
import { ApiOperation, ApiProperty } from '@nestjs/swagger';

class RegistrationDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'Ivan', nullable: false, type: String })
  name: string;
  @IsNotEmpty()
  @IsMobilePhone('ru-RU')
  @ApiProperty({ example: '880005553535', nullable: false, type: String })
  mobile: string;
  @IsNotEmpty()
  @ApiProperty({ example: 'qwerty', nullable: false, type: String })
  password: string;
}

class AuthenticationDto {
  @IsMobilePhone('ru-RU')
  @ApiProperty({ example: '880005553535', nullable: false, type: String })
  mobile: string;
  @IsNotEmpty()
  @ApiProperty({ example: 'qwerty', nullable: false, type: String })
  password: string;
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

class FindTaxiDto {
  @ApiProperty({ example: 1, nullable: false, type: Number })
  passengerID: number;
  @ApiProperty({ example: new Point(5, 3), nullable: false, type: Point })
  fromPosition: Point;
  @ApiProperty({ example: new Point(35, 38), nullable: false, type: Point })
  toPosition: Point;
}

class FinishOrderDto {
  @IsNotEmpty()
  @ApiProperty({ example: 7, nullable: false, type: Number })
  userID: number;
}

class GetCurrentOrderInfo {
  @ApiProperty({ example: 7, nullable: false, type: Number })
  passengerID: number;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/registration')
  @ApiOperation({ summary: 'Регистрация' })
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
  @ApiOperation({ summary: 'Авторизация' })
  async authentication(
      @Body() authenticationDto: AuthenticationDto,
  ): Promise<string> {

    let result = (await axios
        .post('http://localhost:4001/findUserByPhonePasswordRole', {
          ...authenticationDto,
          ...{role: 'passenger'},
        })).data;

    if (result.length == 0) {
      throw new HttpException('Ошибка при вводе мобильного номера или пароля!', HttpStatus.UNAUTHORIZED);
    }

    return JSON.stringify(result);
  }

  async checkPassengerExistInDataBase(id: number): Promise<boolean> {
    return (
        (await axios.post('http://localhost:4001/findPassengerByID', { id: id })).data[
            'id'
            ] == id
    );
  }


  @Post('/findTaxi')
  @ApiOperation({ summary: 'Заказ случайного такси' })
  async findTaxi(@Body() findTaxiDto: FindTaxiDto): Promise<any> {
    if ((await this.checkPassengerExistInDataBase(findTaxiDto.passengerID)) == false)
      throw new HttpException('Пассажир с таким ID не существует!', HttpStatus.CONFLICT);


    let result = null;
    const v = (await axios.post('http://localhost:4002/getAllActualPositions')).data;

    if(v.length==0){
      throw new HttpException('Свободных таксистов нет :(', HttpStatus.CONFLICT);
    }

    const c = (await axios.post('http://localhost:4000/getCost', {
      ...{ fromPosition: findTaxiDto.fromPosition },
      ...{ toPosition: findTaxiDto.toPosition },
    })).data;


    for(const a of v) {

      const t = (await axios.post('http://localhost:4001/findDriverByID', {id: a['trackerID']})).data;

      console.log(t['isFree']);

      if (t['isFree']) {
        console.log(a);
        console.log({
          driverID: a['trackerID'],
          passengerID: findTaxiDto.passengerID,
          cost: Math.round(c),
          ...{fromPosition: findTaxiDto.fromPosition},
          ...{toPosition: findTaxiDto.toPosition},
        });


        result = (
            await axios.post('http://localhost:4004/createOrder', {
              driverID: a['trackerID'],
              passengerID: findTaxiDto.passengerID,
              cost: Math.round(c),
              ...{fromPosition: findTaxiDto.fromPosition},
              ...{toPosition: findTaxiDto.toPosition},
            })
        ).data;

        result['driver'] = {...result['driver'], ...v};
      }
    }

    if(result==null){
      throw new HttpException('Свободных таксистов нет :(', HttpStatus.CONFLICT);
    }

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
  @ApiOperation({ summary: 'Завершить текущий заказ' })
  async finishOrder(
      @Body() finishOrderDto: FinishOrderDto,
  ): Promise<string> {

    const findedOrder = (
        await axios.post('http://localhost:4004/findOrderByParams', {
          passenger: finishOrderDto.userID,
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


  @Post('/getCurrentOrderInfo')
  @ApiOperation({ summary: 'Получить сведения о заказе' })
  async getCurrentOrderInfo(@Body() getCurrentOrderInfoDto: GetCurrentOrderInfo): Promise<string> {
    const omitDeep = require("omit-deep-lodash");

      let findedOrder = (
        await axios.post('http://localhost:4004/findOrderByParams', {
          passenger: getCurrentOrderInfoDto.passengerID,
          enabled: true,
        })
    ).data;

    findedOrder = omitDeep(findedOrder, ['password', 'enabled']);
    console.log(findedOrder);

    /*    let result;
        try {
          result = JSON.stringify(
              (
                  await axios.post('http://localhost:4004/disableOrderByID', {
                    orderID: findedOrder['id'],
                  })
              ).data,
          )
        } catch {
          throw new HttpException('Актуальных поездок нет, поэтому завершать нечего!', HttpStatus.CONFLICT);
        }*/

    return JSON.stringify(findedOrder);
  }
}
