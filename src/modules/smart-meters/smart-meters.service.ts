import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SmartMeter } from '../../entities/smart-meter.entity';
import { CreateSmartMeterDto } from './dto/create-smart-meter.dto';
import { UpdateSmartMeterDto } from './dto/update-smart-meter.dto';

@Injectable()
export class SmartMetersService {
  constructor(
    @InjectRepository(SmartMeter)
    private smartMeterRepository: Repository<SmartMeter>,
  ) {}

  async create(createSmartMeterDto: CreateSmartMeterDto): Promise<SmartMeter> {
    const smartMeter = this.smartMeterRepository.create(createSmartMeterDto);
    return this.smartMeterRepository.save(smartMeter);
  }

  async findAll(): Promise<SmartMeter[]> {
    return this.smartMeterRepository.find({
      relations: ['user', 'utility_company', 'meter_readings', 'bills'],
    });
  }

  async findOne(id: number): Promise<SmartMeter> {
    const smartMeter = await this.smartMeterRepository.findOne({
      where: { meter_id: id },
      relations: ['user', 'utility_company', 'meter_readings', 'bills'],
    });

    if (!smartMeter) {
      throw new NotFoundException(`Smart meter with ID ${id} not found`);
    }

    return smartMeter;
  }

  async findByUserId(userId: number): Promise<SmartMeter[]> {
    return this.smartMeterRepository.find({
      where: { user_id: userId },
      relations: ['user', 'utility_company', 'meter_readings', 'bills'],
    });
  }

  async findByUtilityId(utilityId: number): Promise<SmartMeter[]> {
    return this.smartMeterRepository.find({
      where: { utility_id: utilityId },
      relations: ['user', 'utility_company', 'meter_readings', 'bills'],
    });
  }

  async findBySerialNumber(serialNumber: string): Promise<SmartMeter> {
    const smartMeter = await this.smartMeterRepository.findOne({
      where: { meter_serial_number: serialNumber },
      relations: ['user', 'utility_company', 'meter_readings', 'bills'],
    });

    if (!smartMeter) {
      throw new NotFoundException(`Smart meter with serial number ${serialNumber} not found`);
    }

    return smartMeter;
  }

  async update(id: number, updateSmartMeterDto: UpdateSmartMeterDto): Promise<SmartMeter> {
    const smartMeter = await this.findOne(id);
    Object.assign(smartMeter, updateSmartMeterDto);
    return this.smartMeterRepository.save(smartMeter);
  }

  async remove(id: number): Promise<void> {
    const smartMeter = await this.findOne(id);
    await this.smartMeterRepository.remove(smartMeter);
  }
}