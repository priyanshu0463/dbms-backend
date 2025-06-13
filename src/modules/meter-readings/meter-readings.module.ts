import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeterReadingsService } from './meter-readings.service';
import { MeterReadingsController } from './meter-readings.controller';
import { MeterReading } from '../../entities/meter-reading.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MeterReading])],
  controllers: [MeterReadingsController],
  providers: [MeterReadingsService],
  exports: [MeterReadingsService],
})
export class MeterReadingsModule {}