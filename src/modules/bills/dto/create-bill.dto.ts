import { IsNumber, IsString, IsDateString, IsOptional, IsEnum, IsDecimal } from 'class-validator';
import { BillStatus } from '../../../entities/bill.entity';

export class CreateBillDto {
  @IsNumber()
  user_id: number;

  @IsNumber()
  meter_id: number;

  @IsNumber()
  utility_id: number;

  @IsString()
  bill_number: string;

  @IsDateString()
  billing_period_start: string;

  @IsDateString()
  billing_period_end: string;

  @IsOptional()
  @IsNumber()
  previous_reading?: number;

  @IsOptional()
  @IsNumber()
  current_reading?: number;

  @IsNumber()
  units_consumed: number;

  @IsOptional()
  @IsNumber()
  energy_charges?: number;

  @IsOptional()
  @IsNumber()
  fixed_charges?: number;

  @IsOptional()
  @IsNumber()
  peak_charges?: number;

  @IsOptional()
  @IsNumber()
  off_peak_charges?: number;

  @IsOptional()
  @IsNumber()
  tax_amount?: number;

  @IsOptional()
  @IsNumber()
  subsidy_amount?: number;

  @IsNumber()
  total_amount: number;

  @IsDateString()
  due_date: string;

  @IsOptional()
  @IsEnum(BillStatus)
  bill_status?: BillStatus;

  @IsOptional()
  @IsDateString()
  payment_date?: string;
}