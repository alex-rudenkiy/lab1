import {Body, Controller, Get, HttpException, HttpStatus, Post} from '@nestjs/common';
import { AppService } from './app.service';
import { User } from './database/entity/user/user.entity';
import { UsersService } from './database/entity/user/users.service';
import { tryCatch } from 'rxjs/internal-compatibility';
import {ApiOperation, ApiProperty, ApiResponse} from "@nestjs/swagger";
import axios from 'axios';

export class CreateUserDto {
  @ApiProperty({example:"Mike", nullable: false})
  readonly name: string;
  @ApiProperty({example:"qwerty", nullable: false})
  readonly password: string;
  @ApiProperty({default:""})
  readonly payload: string;
  @ApiProperty({nullable: false})
  readonly role: string;
  @ApiProperty({example:"123"})
  readonly mobile: string;
}

class DeleteUserByIDDto {
  @ApiProperty({example:1})
  readonly id: number;
}

class FindUserByIDDto {
  @ApiProperty({example:1})
  readonly id: number;
}

class FindUserByPhonePasswordRoleDto {
  @ApiProperty({example:"88005553535"})
  readonly mobile: string;
  @ApiProperty({example:"123"})
  readonly password: string;
  @ApiProperty({example:"Passenger", enum: ['Driver', 'Passenger']})
  readonly role: string;
}

class UpdateUserByIDDto {
  @ApiProperty({example:1})
  readonly id: number;
  @ApiProperty({example:true})
  readonly enabled: boolean;
  @ApiProperty({example:"John"})
  readonly name: string;
  @ApiProperty({example:"123"})
  readonly password: string;
  @ApiProperty({example:"123"})
  readonly mobile: string;
  @ApiProperty()
  readonly payload: string;
}


class findDriverByIDDto {
  @ApiProperty({example:1})
  readonly id: number;
}

class FindPassengerByIDDto {
  @ApiProperty({example:1})
  readonly id: number;
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly userService: UsersService,
  ) {}

  @Post('/createUser')
  @ApiOperation({ summary: 'Создание пользователя' })
  createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    console.log(createUserDto);
    const user = new User();
    user.name = createUserDto.name;
    user.password = createUserDto.password;
    user.payload = createUserDto.payload;
    user.mobile = createUserDto.mobile;
    user.role = createUserDto.role;
    return this.userService.save(user);
  }

  @Post('/findUserByID')
  @ApiOperation({ summary: 'Поиск пользователя по ID' })
  findUserByID(@Body() findUserByIDDto: FindUserByIDDto): Promise<User> {
    return this.userService.findOne(String(findUserByIDDto.id));
  }

  @Post('/findPassengerByID')
  @ApiOperation({summary: 'Поиск пассажира по ID'})
  async findPassengerByID(@Body() findPassengerByIDDto: FindPassengerByIDDto): Promise<User> {


    let result = (await this.userService.find({id: String(findPassengerByIDDto.id), role: "passenger"})).pop();

    return result;
  }

  @Post('/findDriverByID')
  @ApiOperation({summary: 'Поиск водителя по ID'})
  async findDriverByID(@Body() findDriverByIDDto: findDriverByIDDto): Promise<User> {

    const f = (
        await axios.post('http://localhost:4004/findOrderByParams', {
          driver: findDriverByIDDto.id,
          enabled: true
        })
    ).data;



    console.log(await this.userService.find({id: String(findDriverByIDDto.id), role: "driver"}).then(r => r.pop()));

    let result = (await this.userService.find({id: String(findDriverByIDDto.id), role: "driver"})).pop();
    result['isFree'] = f.length==0?true:false//Свободен ли водитель

    return result;
  }

  @Post('/findUserByPhonePasswordRole')
  @ApiOperation({ summary: 'Поиск пользователя по мобильному номеру и паролю' })
  findUserByPhonePasswordRole(@Body() findUserByPhonePasswordRoleDto: FindUserByPhonePasswordRoleDto): Promise<User[]> {
    console.log(findUserByPhonePasswordRoleDto);
    return this.userService.find({mobile: findUserByPhonePasswordRoleDto.mobile, password: findUserByPhonePasswordRoleDto.password, role: findUserByPhonePasswordRoleDto.role});
  }



  @Post('/updateUserByID')
  @ApiOperation({ summary: 'Обновление даннных пользователя по ID', description: "Необходимо, чтобы все поля были заполненны" })
  updateUserByID(@Body() updateUserByIDDto: UpdateUserByIDDto): Promise<User> {
    return this.userService
      .findOne(String(updateUserByIDDto.id))
      .then((u) => {
        u.name = updateUserByIDDto.name;
        u.password = updateUserByIDDto.password;
        u.payload = updateUserByIDDto.payload;
        u.enabled = updateUserByIDDto.enabled;
        return u;
      })
      .then((u) => this.userService.save(u));
  }

  @Post('/deleteUserByID')
  @ApiOperation({ summary: 'Удаление пользователя по ID' })
  deleteUserByID(@Body() deleteUserByIDDto: DeleteUserByIDDto): Promise<void> {
    return this.userService.remove(String(deleteUserByIDDto.id));
  }
}
