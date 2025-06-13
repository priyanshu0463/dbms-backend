import { PartialType } from '@nestjs/mapped-types';
import { CreateSmartMeterDto } from './create-smart-meter.dto';

export class UpdateSmartMeterDto extends PartialType(CreateSmartMeterDto) {}