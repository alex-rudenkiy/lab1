import {Body, Controller, Get, Post} from '@nestjs/common';
import {AppService} from './app.service';
import {ApiOperation, ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty} from "class-validator";

class Point {
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    @ApiProperty({ example: 120, nullable: false, type: Number, required: true })
    x: number;
    @ApiProperty({ example: 535, nullable: false, type: Number, required: true })
    y: number;
}

class GetCostDto {
    @IsNotEmpty()
    @ApiProperty({ example: new Point(5, 3), nullable: false, type: Point, required: true })
    fromPosition: Point;
    @IsNotEmpty()
    @ApiProperty({ example: new Point(8, 11), nullable: false, type: Point, required: true })
    toPosition: Point;
    @IsNotEmpty()
    @ApiProperty({ example: 0.95, nullable: false, type: Number, required: false })
    coefficient: number;
}

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {
    }

    @Post('/getCost')
    @ApiOperation({summary: 'Подсчитать и получить стоимость поездки между двумя точками и надбавочным коэффициентом(опционально)'})
    getCost(@Body() getCostDto: GetCostDto): string {
        console.log(getCostDto.coefficient == undefined ? 1 : getCostDto.coefficient);
        return String(Math.sqrt(Math.pow((getCostDto.toPosition.x - getCostDto.fromPosition.x), 2) + Math.pow((getCostDto.toPosition.y - getCostDto.fromPosition.y), 2)) * (getCostDto.coefficient == undefined ? 1 : getCostDto.coefficient));
    }
}
