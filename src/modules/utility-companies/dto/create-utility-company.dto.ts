import { IsString, IsEmail, IsEnum, IsOptional, Length } from 'class-validator';
import { UtilityType } from '../../../entities/utility-company.entity';

export class CreateUtilityCompanyDto {
  @IsString()
  @Length(1, 255)
  company_name: string;

  @IsString()
  @Length(1, 50)
  company_code: string;

  @IsEnum(UtilityType)
  type: UtilityType;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  state?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  region?: string;

  @IsOptional()
  @IsEmail()
  contact_email?: string;

  @IsOptional()
  @IsString()
  @Length(1, 15)
  contact_phone?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  regulatory_body?: string;
}
