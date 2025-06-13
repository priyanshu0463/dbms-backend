import { IsString, IsEmail, IsEnum, IsOptional, IsNumber, Length, IsDecimal } from 'class-validator';
import { ConnectionType, UserStatus } from '../../../entities/user.entity';

export class CreateUserDto {
  @IsString()
  @Length(1, 50)
  customer_id: string;

  @IsString()
  @Length(1, 100)
  first_name: string;

  @IsString()
  @Length(1, 100)
  last_name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(1, 15)
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  city?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  state?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  pincode?: string;

  @IsNumber()
  utility_id: number;

  @IsEnum(ConnectionType)
  connection_type: ConnectionType;

  @IsOptional()
  @IsNumber()
  connection_load?: number;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  tariff_category?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}