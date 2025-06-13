import { IsNumber, IsDateString, IsOptional, IsEnum, IsDecimal } from 'class-validator';
import { TodSlot } from '../../../entities/meter-reading.entity';

export class CreateMeterReadingDto {
  @IsNumber()
  meter_id: number;

  @IsDateString()
  timestamp: string;

  @IsNumber()
  energy_consumed: number;

  @IsOptional()
  @IsNumber()
  power_factor?: number;

  @IsOptional()
  @IsNumber()
  voltage?: number;

  @IsOptional()
  @IsNumber()
  current?: number;

  @IsOptional()
  @IsNumber()
  frequency?: number;

  @IsOptional()
  @IsNumber()
  reactive_power?: number;

  @IsOptional()
  @IsNumber()
  apparent_power?: number;

  @IsOptional()
  @IsNumber()
  quarter?: number;

  @IsOptional()
  @IsNumber()
  season?: number;

  @IsOptional()
  @IsEnum(TodSlot)
  tod_slot?: TodSlot;
}
