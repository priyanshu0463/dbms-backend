import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmartMetersService } from './smart-meters.service';
import { SmartMetersController } from './smart-meters.controller';
import { SmartMeter } from '../../entities/smart-meter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SmartMeter])],
  controllers: [SmartMetersController],
  providers: [SmartMetersService],
  exports: [SmartMetersService],
})
export class SmartMetersModule {}
