import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  IsDecimal,
} from 'class-validator';
import { MeterStatus } from '../../../entities/smart-meter.entity';

export class CreateSmartMeterDto {
  @IsString()
  meter_serial_number: string;

  @IsNumber()
  user_id: number;

  @IsNumber()
  utility_id: number;

  @IsOptional()
  @IsString()
  meter_type?: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsDateString()
  installation_date?: string;

  @IsOptional()
  @IsDateString()
  last_calibration_date?: string;

  @IsOptional()
  @IsDateString()
  next_calibration_date?: string;

  @IsOptional()
  @IsEnum(MeterStatus)
  status?: MeterStatus;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}