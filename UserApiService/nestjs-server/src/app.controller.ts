import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { User } from './database/entity/user/user.entity';
import { UsersService } from './database/entity/user/users.service';
import { tryCatch } from 'rxjs/internal-compatibility';
import {ApiOperation, ApiProperty, ApiResponse} from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({example:"Mike"})
  readonly login: string;
  @ApiProperty({example:"qwerty"})
  readonly password: string;
  @ApiProperty()
  readonly payload: string;
}

class DeleteUserByIDDto {
  @ApiProperty({example:1})
  readonly id: number;
}

class FindUserByIDDto {
  @ApiProperty({example:1})
  readonly id: number;
}

class UpdateUserByIDDto {
  @ApiProperty({example:1})
  readonly id: number;
  @ApiProperty({example:true})
  readonly enabled: boolean;
  @ApiProperty({example:"John"})
  readonly login: string;
  @ApiProperty({example:"123"})
  readonly password: string;
  @ApiProperty()
  readonly payload: string;
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
    user.login = createUserDto.login;
    user.password = createUserDto.password;
    user.payload = createUserDto.payload;
    return this.userService.save(user);
  }

  @Post('/findUserByID')
  @ApiOperation({ summary: 'Поиск пользователя по ID' })
  findUserByID(@Body() findUserByIDDto: FindUserByIDDto): Promise<User> {
    return this.userService.findOne(String(findUserByIDDto.id));
  }

  @Post('/updateUserByID')
  @ApiOperation({ summary: 'Обновление даннных пользователя по ID', description: "Необходимо, чтобы все поля были заполненны" })
  updateUserByID(@Body() updateUserByIDDto: UpdateUserByIDDto): Promise<User> {
    return this.userService
      .findOne(String(updateUserByIDDto.id))
      .then((u) => {
        u.login = updateUserByIDDto.login;
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
