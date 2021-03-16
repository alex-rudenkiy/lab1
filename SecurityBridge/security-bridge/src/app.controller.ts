/* eslint-disable */
import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { stringify } from 'querystring';

@Controller()
export class AppController {
  private passengerServiceEndpoint: string = "http://localhost:4003";//clientapiservice
  private driverServiceEndpoint: string = "http://localhost:4005";//driverapiservice

  constructor(private readonly appService: AppService, private jwtService: JwtService) {
  }


  @Get("")
  getHello(@Req() request: Request): string {
    console.log(request);
    return request.originalUrl;//this.appService.getHello();
  }

  @Post("/:authEndpoint/login")
  async login(@Req() request: Request, @Param() params: string, @Body() data:any): Promise<{ access_token: string }> {
    let authFullEndpoint = "";
    const axios = require('axios').default;

    switch (params['authEndpoint']) {
      case "passenger":
        authFullEndpoint = this.passengerServiceEndpoint;
        break;
      case "driver":
        authFullEndpoint = this.driverServiceEndpoint;
        break;
      default:
        alert("Нет таких значений");
    }

    try{
      let result = (await axios.post(`${authFullEndpoint}/authentication`, data)).data[0];
      console.log(result);

      const payload = { name: result['name'], userId: result['id'] };

      return {
        ... result.data,
        ... { access_token: this.jwtService.sign(payload, { expiresIn: '2 days' }) }
      };
    }catch(e){
      return e;
    }
  }

  @Post("/:authEndpoint/registration")
  async registration(@Req() request: Request, @Param() params: string, @Body() data:any): Promise<{ access_token: string }> {

    let authFullEndpoint = "";
    const axios = require('axios').default;

    switch (params['authEndpoint']) {
      case "passenger":
        authFullEndpoint = this.passengerServiceEndpoint;
        break;
      case "driver":
        authFullEndpoint = this.driverServiceEndpoint;
        break;
      default:
        alert("Нет таких значений");
    }

    try{
      let result = (await axios.post(`${authFullEndpoint}/registration`, data)).data;

      const payload = { name: result['name'], userId: result['id'] };
      console.log(payload);

      return {
        ... result.data,
        ... { access_token: this.jwtService.sign(payload, { expiresIn: '2 days' }) }
      };
    }catch(e){
      //console.log(e.response);
      throw new HttpException(e.response.data, e.response.status);
    }
  }



  @Post("/:authEndpoint/*")
  async action(@Req() request: Request, @Param() params: string, @Body() data:any): Promise<{ access_token: string }> {
    let authFullEndpoint = "";
    const axios = require('axios').default;

    switch (params['authEndpoint']) {
      case "passenger":
        authFullEndpoint = this.passengerServiceEndpoint;
        break;
      case "driver":
        authFullEndpoint = this.driverServiceEndpoint;
        break;
      default:
        alert("Нет таких значений");
    }

    const { access_token, ... srcdata } = data;

    let userTokenPayload;
    try{
      this.jwtService.verify(access_token);
      userTokenPayload = this.jwtService.decode(access_token);
      console.log(userTokenPayload);
    }catch (e) {
      return e;
    }


    console.log(userTokenPayload.userId);
      try{
        let result = (await axios.post(`${authFullEndpoint}${request.originalUrl.replace(`/${params['authEndpoint']}`,"")}`, {...{userId:userTokenPayload.userId}, ...srcdata})).data;
        //console.log(result);
        return result;
      }catch(e){
        //console.log(e);
        return e;
      }



  }

  @Get("/auth")
  async auth(@Req() request: Request): Promise<string> {
    //
    const payload = '{"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImxvbDIiLCJzdWIiOjEsImlhdCI6MTYxNDc3ODQ5MiwiZXhwIjoxNjE0Nzc4NTUyfQ.2OoTWh2PoGWRRthkC5DJlW8OjqoSHPVuqCleK0eS4Uc"}';
    return stringify((await this.jwtService.verify("eyJhbGсiOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImxvbDIiLCJzdWIiOjEsImlhdCI6MTYxNDc3OTU4NCwiZXhwIjoxNjE0Nzc5NjQ0fQ.dOsjqKMGxZDzIKNiOOEI5JyevgI8L4nCeEqwSWOsMTg")).access_token);
  }

}
