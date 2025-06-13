import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { SmartMetersService } from './smart-meters.service';
import { CreateSmartMeterDto } from './dto/create-smart-meter.dto';
import { UpdateSmartMeterDto } from './dto/update-smart-meter.dto';

@Controller('smart-meters')
export class SmartMetersController {
  constructor(private readonly smartMetersService: SmartMetersService) {}

  @Post()
  create(@Body() createSmartMeterDto: CreateSmartMeterDto) {
    return this.smartMetersService.create(createSmartMeterDto);
  }

  @Get()
  findAll() {
    return this.smartMetersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.smartMetersService.findOne(id);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.smartMetersService.findByUserId(userId);
  }

  @Get('utility/:utilityId')
  findByUtilityId(@Param('utilityId', ParseIntPipe) utilityId: number) {
    return this.smartMetersService.findByUtilityId(utilityId);
  }

  @Get('serial/:serialNumber')
  findBySerialNumber(@Param('serialNumber') serialNumber: string) {
    return this.smartMetersService.findBySerialNumber(serialNumber);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSmartMeterDto: UpdateSmartMeterDto) {
    return this.smartMetersService.update(id, updateSmartMeterDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.smartMetersService.remove(id);
  }
}