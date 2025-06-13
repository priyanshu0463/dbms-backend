import { PartialType } from '@nestjs/mapped-types';
import { CreateUtilityCompanyDto } from './create-utility-company.dto';

export class UpdateUtilityCompanyDto extends PartialType(
  CreateUtilityCompanyDto,
) {}
