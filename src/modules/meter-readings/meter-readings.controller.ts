import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { MeterReadingsService } from './meter-readings.service';
import { CreateMeterReadingDto } from './dto/create-meter-reading.dto';
import { UpdateMeterReadingDto } from './dto/update-meter-reading.dto';

@Controller('meter-readings')
export class MeterReadingsController {
  constructor(private readonly meterReadingsService: MeterReadingsService) {}

  @Post()
  create(@Body() createMeterReadingDto: CreateMeterReadingDto) {
    return this.meterReadingsService.create(createMeterReadingDto);
  }

  @Get()
  findAll() {
    return this.meterReadingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.meterReadingsService.findOne(id);
  }

  @Get('meter/:meterId')
  findByMeterId(
    @Param('meterId', ParseIntPipe) meterId: number,
    @Query('limit') limit?: number,
  ) {
    return this.meterReadingsService.findByMeterId(meterId, limit);
  }

  @Get('meter/:meterId/latest')
  findLatestByMeterId(@Param('meterId', ParseIntPipe) meterId: number) {
    return this.meterReadingsService.findLatestByMeterId(meterId);
  }

  @Get('meter/:meterId/range')
  findByMeterIdAndDateRange(
    @Param('meterId', ParseIntPipe) meterId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.meterReadingsService.findByMeterIdAndDateRange(
      meterId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('meter/:meterId/stats')
  getConsumptionStats(
    @Param('meterId', ParseIntPipe) meterId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.meterReadingsService.getConsumptionStats(
      meterId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateMeterReadingDto: UpdateMeterReadingDto) {
    return this.meterReadingsService.update(id, updateMeterReadingDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.meterReadingsService.remove(id);
  }
}