import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { MeterReading } from '../../entities/meter-reading.entity';
import { CreateMeterReadingDto } from './dto/create-meter-reading.dto';
import { UpdateMeterReadingDto } from './dto/update-meter-reading.dto';

@Injectable()
export class MeterReadingsService {
  constructor(
    @InjectRepository(MeterReading)
    private meterReadingRepository: Repository<MeterReading>,
  ) {}

  async create(createMeterReadingDto: CreateMeterReadingDto): Promise<MeterReading> {
    const meterReading = this.meterReadingRepository.create(createMeterReadingDto);
    return this.meterReadingRepository.save(meterReading);
  }

  async findAll(): Promise<MeterReading[]> {
    return this.meterReadingRepository.find({
      relations: ['smart_meter'],
      order: { timestamp: 'DESC' },
    });
  }

  async findOne(id: number): Promise<MeterReading> {
    const meterReading = await this.meterReadingRepository.findOne({
      where: { reading_id: id },
      relations: ['smart_meter'],
    });

    if (!meterReading) {
      throw new NotFoundException(`Meter reading with ID ${id} not found`);
    }

    return meterReading;
  }

  async findByMeterId(meterId: number, limit: number = 100): Promise<MeterReading[]> {
    return this.meterReadingRepository.find({
      where: { meter_id: meterId },
      relations: ['smart_meter'],
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async findByMeterIdAndDateRange(
    meterId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<MeterReading[]> {
    return this.meterReadingRepository.find({
      where: {
        meter_id: meterId,
        timestamp: Between(startDate, endDate),
      },
      relations: ['smart_meter'],
      order: { timestamp: 'ASC' },
    });
  }

  async findLatestByMeterId(meterId: number): Promise<MeterReading> {
    const meterReading = await this.meterReadingRepository.findOne({
      where: { meter_id: meterId },
      relations: ['smart_meter'],
      order: { timestamp: 'DESC' },
    });

    if (!meterReading) {
      throw new NotFoundException(`No meter readings found for meter ID ${meterId}`);
    }

    return meterReading;
  }

  async update(id: number, updateMeterReadingDto: UpdateMeterReadingDto): Promise<MeterReading> {
    const meterReading = await this.findOne(id);
    Object.assign(meterReading, updateMeterReadingDto);
    return this.meterReadingRepository.save(meterReading);
  }

  async remove(id: number): Promise<void> {
    const meterReading = await this.findOne(id);
    await this.meterReadingRepository.remove(meterReading);
  }

  async getConsumptionStats(meterId: number, startDate: Date, endDate: Date) {
    return this.meterReadingRepository
      .createQueryBuilder('reading')
      .select([
        'AVG(reading.energy_consumed) as avg_consumption',
        'MAX(reading.energy_consumed) as max_consumption',
        'MIN(reading.energy_consumed) as min_consumption',
        'SUM(reading.energy_consumed) as total_consumption',
        'COUNT(reading.reading_id) as reading_count',
      ])
      .where('reading.meter_id = :meterId', { meterId })
      .andWhere('reading.timestamp BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();
  }
}