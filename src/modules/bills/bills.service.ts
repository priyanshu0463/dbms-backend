import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Bill, BillStatus } from '../../entities/bill.entity';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';

@Injectable()
export class BillsService {
  constructor(
    @InjectRepository(Bill)
    private billRepository: Repository<Bill>,
  ) {}

  async create(createBillDto: CreateBillDto): Promise<Bill> {
    const bill = this.billRepository.create(createBillDto);
    return this.billRepository.save(bill);
  }

  async findAll(): Promise<Bill[]> {
    return this.billRepository.find({
      relations: ['user', 'smart_meter', 'utility_company'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Bill> {
    const bill = await this.billRepository.findOne({
      where: { bill_id: id },
      relations: ['user', 'smart_meter', 'utility_company'],
    });

    if (!bill) {
      throw new NotFoundException(`Bill with ID ${id} not found`);
    }

    return bill;
  }

  async findByUserId(userId: number): Promise<Bill[]> {
    return this.billRepository.find({
      where: { user_id: userId },
      relations: ['user', 'smart_meter', 'utility_company'],
      order: { created_at: 'DESC' },
    });
  }

  async findByMeterId(meterId: number): Promise<Bill[]> {
    return this.billRepository.find({
      where: { meter_id: meterId },
      relations: ['user', 'smart_meter', 'utility_company'],
      order: { created_at: 'DESC' },
    });
  }

  async findByUtilityId(utilityId: number): Promise<Bill[]> {
    return this.billRepository.find({
      where: { utility_id: utilityId },
      relations: ['user', 'smart_meter', 'utility_company'],
      order: { created_at: 'DESC' },
    });
  }

  async findByBillNumber(billNumber: string): Promise<Bill> {
    const bill = await this.billRepository.findOne({
      where: { bill_number: billNumber },
      relations: ['user', 'smart_meter', 'utility_company'],
    });

    if (!bill) {
      throw new NotFoundException(`Bill with number ${billNumber} not found`);
    }

    return bill;
  }

  async findByStatus(status: BillStatus): Promise<Bill[]> {
    return this.billRepository.find({
      where: { bill_status: status },
      relations: ['user', 'smart_meter', 'utility_company'],
      order: { created_at: 'DESC' },
    });
  }

  async findOverdueBills(): Promise<Bill[]> {
    const today = new Date();
    return this.billRepository.find({
      where: {
        due_date: Between(new Date('1900-01-01'), today),
        bill_status: BillStatus.SENT,
      },
      relations: ['user', 'smart_meter', 'utility_company'],
      order: { due_date: 'ASC' },
    });
  }

  async update(id: number, updateBillDto: UpdateBillDto): Promise<Bill> {
    const bill = await this.findOne(id);
    Object.assign(bill, updateBillDto);
    return this.billRepository.save(bill);
  }

  async markAsPaid(id: number): Promise<Bill> {
    const bill = await this.findOne(id);
    bill.bill_status = BillStatus.PAID;
    bill.payment_date = new Date();
    return this.billRepository.save(bill);
  }

  async remove(id: number): Promise<void> {
    const bill = await this.findOne(id);
    await this.billRepository.remove(bill);
  }

  async getBillSummary(userId: number, year: number) {
    return this.billRepository
      .createQueryBuilder('bill')
      .select([
        'COUNT(bill.bill_id) as total_bills',
        'SUM(bill.total_amount) as total_amount',
        'SUM(bill.units_consumed) as total_units',
        'AVG(bill.total_amount) as avg_amount',
      ])
      .where('bill.user_id = :userId', { userId })
      .andWhere('EXTRACT(year FROM bill.created_at) = :year', { year })
      .getRawOne();
  }
}