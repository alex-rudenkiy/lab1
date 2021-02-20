import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { User } from './database/entity/user/user.entity';
import { UsersService } from './database/entity/user/users.service';
import { tryCatch } from 'rxjs/internal-compatibility';

class CreateUserDto {
  login: string;
  password: string;
  payload: string;
}

class DeleteUserByIDDto {
  id: number;
}

class FindUserByIDDto {
  id: number;
}

class UpdateUserByIDDto {
  id: number;
  enabled: boolean;
  login: string;
  password: string;
  payload: string;
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly userService: UsersService,
  ) {}

  @Post('/createUser')
  createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    console.log(createUserDto);
    const user = new User();
    user.login = createUserDto.login;
    user.password = createUserDto.password;
    user.payload = createUserDto.payload;
    return this.userService.save(user);
  }

  @Post('/findUserByID')
  findUserByID(@Body() findUserByIDDto: FindUserByIDDto): Promise<User> {
    return this.userService.findOne(String(findUserByIDDto.id));
  }

  @Post('/updateUserByID')
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
  deleteUserByID(@Body() deleteUserByIDDto: DeleteUserByIDDto): Promise<void> {
    return this.userService.remove(String(deleteUserByIDDto.id));
  }
}
