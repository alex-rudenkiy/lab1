import {Body, Controller, Get, Post} from '@nestjs/common';
import {AppService} from './app.service';

class Point {
    x: number;
    y: number;
}

class GetCostDto {
    fromPosition: Point;
    toPosition: Point;
    coefficient: number;
}

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {
    }

    @Post('/getCost')
    getCost(@Body() getCostDto: GetCostDto): string {
        console.log(getCostDto.coefficient == undefined ? 1 : getCostDto.coefficient);
        return String(Math.sqrt(Math.pow((getCostDto.toPosition.x - getCostDto.fromPosition.x), 2) + Math.pow((getCostDto.toPosition.y - getCostDto.fromPosition.y), 2)) * (getCostDto.coefficient == undefined ? 1 : getCostDto.coefficient));
    }
}
