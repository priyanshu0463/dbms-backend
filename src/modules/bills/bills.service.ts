// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository, Between } from 'typeorm';
// import { Bill, BillStatus } from '../../entities/bill.entity';
// import { CreateBillDto } from './dto/create-bill.dto';
// import { UpdateBillDto } from './dto/update-bill.dto';

// @Injectable()
// export class BillsService {
//   constructor(
//     @InjectRepository(Bill)
//     private billRepository: Repository<Bill>,
//   ) {}

//   async create(createBillDto: CreateBillDto): Promise<Bill> {
//     const bill = this.billRepository.create(createBillDto);
//     return this.billRepository.save(bill);
//   }

//   async findAll(): Promise<Bill[]> {
//     return this.billRepository.find({
//       relations: ['user', 'smart_meter', 'utility_company'],
//       order: { created_at: 'DESC' },
//     });
//   }

//   async findOne(id: number): Promise<Bill> {
//     const bill = await this.billRepository.findOne({
//       where: { bill_id: id },
//       relations: ['user', 'smart_meter', 'utility_company'],
//     });

//     if (!bill) {
//       throw new NotFoundException(`Bill with ID ${id} not found`);
//     }

//     return bill;
//   }

//   async findByUserId(userId: number): Promise<Bill[]> {
//     return this.billRepository.find({
//       where: { user_id: userId },
//       relations: ['user', 'smart_meter', 'utility_company'],
//       order: { created_at: 'DESC' },
//     });
//   }

//   async findByMeterId(meterId: number): Promise<Bill[]> {
//     return this.billRepository.find({
//       where: { meter_id: meterId },
//       relations: ['user', 'smart_meter', 'utility_company'],
//       order: { created_at: 'DESC' },
//     });
//   }

//   async findByUtilityId(utilityId: number): Promise<Bill[]> {
//     return this.billRepository.find({
//       where: { utility_id: utilityId },
//       relations: ['user', 'smart_meter', 'utility_company'],
//       order: { created_at: 'DESC' },
//     });
//   }

//   async findByBillNumber(billNumber: string): Promise<Bill> {
//     const bill = await this.billRepository.findOne({
//       where: { bill_number: billNumber },
//       relations: ['user', 'smart_meter', 'utility_company'],
//     });

//     if (!bill) {
//       throw new NotFoundException(`Bill with number ${billNumber} not found`);
//     }

//     return bill;
//   }

//   async findByStatus(status: BillStatus): Promise<Bill[]> {
//     return this.billRepository.find({
//       where: { bill_status: status },
//       relations: ['user', 'smart_meter', 'utility_company'],
//       order: { created_at: 'DESC' },
//     });
//   }

//   async findOverdueBills(): Promise<Bill[]> {
//     const today = new Date();
//     return this.billRepository.find({
//       where: {
//         due_date: Between(new Date('1900-01-01'), today),
//         bill_status: BillStatus.SENT,
//       },
//       relations: ['user', 'smart_meter', 'utility_company'],
//       order: { due_date: 'ASC' },
//     });
//   }

//   async update(id: number, updateBillDto: UpdateBillDto): Promise<Bill> {
//     const bill = await this.findOne(id);
//     Object.assign(bill, updateBillDto);
//     return this.billRepository.save(bill);
//   }

//   async markAsPaid(id: number): Promise<Bill> {
//     const bill = await this.findOne(id);
//     bill.bill_status = BillStatus.PAID;
//     bill.payment_date = new Date();
//     return this.billRepository.save(bill);
//   }

//   async remove(id: number): Promise<void> {
//     const bill = await this.findOne(id);
//     await this.billRepository.remove(bill);
//   }

//   async getBillSummary(userId: number, year: number) {
//     return this.billRepository
//       .createQueryBuilder('bill')
//       .select([
//         'COUNT(bill.bill_id) as total_bills',
//         'SUM(bill.total_amount) as total_amount',
//         'SUM(bill.units_consumed) as total_units',
//         'AVG(bill.total_amount) as avg_amount',
//       ])
//       .where('bill.user_id = :userId', { userId })
//       .andWhere('EXTRACT(year FROM bill.created_at) = :year', { year })
//       .getRawOne();
//   }
// }


import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    const queryRunner = this.billRepository.manager.connection.createQueryRunner();
    
    try {
      // Calculate values before the query to avoid type ambiguity
      const unitsConsumed = createBillDto.units_consumed || 
        (createBillDto.current_reading && createBillDto.previous_reading 
          ? createBillDto.current_reading - createBillDto.previous_reading 
          : createBillDto.current_reading || 0);

      const energyCharges = createBillDto.energy_charges || 0;
      const fixedCharges = createBillDto.fixed_charges || 0;
      const peakCharges = createBillDto.peak_charges || 0;
      const offPeakCharges = createBillDto.off_peak_charges || 0;
      const taxAmount = createBillDto.tax_amount || 0;
      const subsidyAmount = createBillDto.subsidy_amount || 0;
      
      // Calculate total amount using arithmetic operators
      const totalAmount = createBillDto.total_amount || 
        (energyCharges + fixedCharges + peakCharges + offPeakCharges + taxAmount - subsidyAmount);

      // Using explicit type casting and arithmetic operators
      const result = await queryRunner.query(`
        INSERT INTO bills (
          user_id, meter_id, utility_id, bill_number, billing_period_start, 
          billing_period_end, previous_reading, current_reading, units_consumed,
          energy_charges, fixed_charges, peak_charges, off_peak_charges,
          tax_amount, subsidy_amount, total_amount, due_date, bill_status
        ) VALUES (
          $1::integer, $2::integer, $3::integer, $4::varchar, $5::date, 
          $6::date, $7::decimal, $8::decimal, $9::decimal,
          $10::decimal, $11::decimal, $12::decimal, $13::decimal,
          $14::decimal, $15::decimal, $16::decimal, $17::date, $18::bills_bill_status_enum
        ) RETURNING *
      `, [
        createBillDto.user_id,
        createBillDto.meter_id,
        createBillDto.utility_id,
        createBillDto.bill_number,
        createBillDto.billing_period_start,
        createBillDto.billing_period_end,
        createBillDto.previous_reading,
        createBillDto.current_reading,
        unitsConsumed,
        energyCharges,
        fixedCharges,
        peakCharges,
        offPeakCharges,
        taxAmount,
        subsidyAmount,
        totalAmount,
        createBillDto.due_date,
        createBillDto.bill_status || BillStatus.GENERATED
      ]);

      
      return this.findOne(result[0].bill_id);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Bill[]> {
    const queryRunner = this.billRepository.manager.connection.createQueryRunner();
    
    try {
      // Using JOIN operations and ORDER BY
      const bills = await queryRunner.query(`
        SELECT 
          b.*,
          u.first_name, u.last_name, u.email, u.customer_id,
          sm.meter_serial_number, sm.meter_type,
          uc.company_name, uc.company_code
        FROM bills b
        INNER JOIN users u ON b.user_id = u.user_id
        INNER JOIN smart_meters sm ON b.meter_id = sm.meter_id
        INNER JOIN utility_companies uc ON b.utility_id = uc.utility_id
        ORDER BY b.created_at DESC
      `);
      
      return bills;
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: number): Promise<Bill> {
    const queryRunner = this.billRepository.manager.connection.createQueryRunner();
    
    try {
      // Using EXISTS subquery and JOIN
      const bills = await queryRunner.query(`
        SELECT 
          b.*,
          u.first_name, u.last_name, u.email, u.customer_id,
          sm.meter_serial_number, sm.meter_type,
          uc.company_name, uc.company_code
        FROM bills b
        INNER JOIN users u ON b.user_id = u.user_id
        INNER JOIN smart_meters sm ON b.meter_id = sm.meter_id
        INNER JOIN utility_companies uc ON b.utility_id = uc.utility_id
        WHERE b.bill_id = $1
        AND EXISTS (
          SELECT 1 FROM users u2 WHERE u2.user_id = b.user_id AND u2.status = 'active'
        )
      `, [id]);

      if (!bills.length) {
        throw new NotFoundException(`Bill with ID ${id} not found`);
      }

      return bills[0];
    } finally {
      await queryRunner.release();
    }
  }

  async findByUserId(userId: number): Promise<Bill[]> {
    const queryRunner = this.billRepository.manager.connection.createQueryRunner();
    
    try {
      // Using Boolean operators and JOIN
      const bills = await queryRunner.query(`
        SELECT 
          b.*,
          u.first_name, u.last_name, u.email,
          sm.meter_serial_number,
          uc.company_name
        FROM bills b
        INNER JOIN users u ON b.user_id = u.user_id
        INNER JOIN smart_meters sm ON b.meter_id = sm.meter_id
        INNER JOIN utility_companies uc ON b.utility_id = uc.utility_id
        WHERE b.user_id = $1 
        AND (u.status = 'active' OR u.status = 'suspended')
        AND b.bill_status IS NOT NULL
        ORDER BY b.created_at DESC
      `, [userId]);
      
      return bills;
    } finally {
      await queryRunner.release();
    }
  }

  async findByMeterId(meterId: number): Promise<Bill[]> {
    const queryRunner = this.billRepository.manager.connection.createQueryRunner();
    
    try {
      // Using IN operator and LEFT JOIN
      const bills = await queryRunner.query(`
        SELECT 
          b.*,
          u.first_name, u.last_name,
          sm.meter_serial_number, sm.status as meter_status,
          uc.company_name
        FROM bills b
        LEFT JOIN users u ON b.user_id = u.user_id
        LEFT JOIN smart_meters sm ON b.meter_id = sm.meter_id
        LEFT JOIN utility_companies uc ON b.utility_id = uc.utility_id
        WHERE b.meter_id = $1
        AND b.bill_status IN ('generated', 'sent', 'paid')
        ORDER BY b.created_at DESC
      `, [meterId]);
      
      return bills;
    } finally {
      await queryRunner.release();
    }
  }

  async findByUtilityId(utilityId: number): Promise<Bill[]> {
    const queryRunner = this.billRepository.manager.connection.createQueryRunner();
    
    try {
      // Using NOT IN and aggregate functions
      const bills = await queryRunner.query(`
        SELECT 
          b.*,
          u.first_name, u.last_name,
          sm.meter_serial_number,
          uc.company_name,
          COUNT(*) OVER (PARTITION BY b.user_id) as user_bill_count
        FROM bills b
        INNER JOIN users u ON b.user_id = u.user_id
        INNER JOIN smart_meters sm ON b.meter_id = sm.meter_id
        INNER JOIN utility_companies uc ON b.utility_id = uc.utility_id
        WHERE b.utility_id = $1
        AND b.bill_status NOT IN ('disputed', 'cancelled')
        ORDER BY b.created_at DESC
      `, [utilityId]);
      
      return bills;
    } finally {
      await queryRunner.release();
    }
  }

  async findByBillNumber(billNumber: string): Promise<Bill> {
    const queryRunner = this.billRepository.manager.connection.createQueryRunner();
    
    try {
      // Using string operators (LIKE, UPPER) and NOT EXISTS
      const bills = await queryRunner.query(`
        SELECT 
          b.*,
          u.first_name, u.last_name, u.email,
          sm.meter_serial_number,
          uc.company_name
        FROM bills b
        INNER JOIN users u ON b.user_id = u.user_id
        INNER JOIN smart_meters sm ON b.meter_id = sm.meter_id
        INNER JOIN utility_companies uc ON b.utility_id = uc.utility_id
        WHERE UPPER(b.bill_number) = UPPER($1)
        AND NOT EXISTS (
          SELECT 1 FROM bills b2 
          WHERE b2.bill_number LIKE CONCAT(b.bill_number, '%') 
          AND b2.bill_id != b.bill_id
        )
      `, [billNumber]);

      if (!bills.length) {
        throw new NotFoundException(`Bill with number ${billNumber} not found`);
      }

      return bills[0];
    } finally {
      await queryRunner.release();
    }
  }

  async findByStatus(status: BillStatus): Promise<Bill[]> {
    const queryRunner = this.billRepository.manager.connection.createQueryRunner();
    
    try {
      // Using to_char, extract functions and HAVING clause
      const bills = await queryRunner.query(`
        SELECT 
          b.*,
          u.first_name, u.last_name,
          sm.meter_serial_number,
          uc.company_name,
          TO_CHAR(b.created_at, 'YYYY-MM') as billing_month,
          EXTRACT(YEAR FROM b.created_at) as billing_year
        FROM bills b
        INNER JOIN users u ON b.user_id = u.user_id
        INNER JOIN smart_meters sm ON b.meter_id = sm.meter_id
        INNER JOIN utility_companies uc ON b.utility_id = uc.utility_id
        WHERE b.bill_status = $1
        GROUP BY b.bill_id, u.first_name, u.last_name, sm.meter_serial_number, uc.company_name
        HAVING COUNT(b.bill_id) > 0
        ORDER BY b.created_at DESC
      `, [status]);
      
      return bills;
    } finally {
      await queryRunner.release();
    }
  }

  async findOverdueBills(): Promise<Bill[]> {
    const queryRunner = this.billRepository.manager.connection.createQueryRunner();
    
    try {
      // Using BETWEEN, NOT BETWEEN and complex Boolean operators
      const bills = await queryRunner.query(`
        SELECT 
          b.*,
          u.first_name, u.last_name, u.phone, u.email,
          sm.meter_serial_number,
          uc.company_name,
          CURRENT_DATE - b.due_date as days_overdue
        FROM bills b
        INNER JOIN users u ON b.user_id = u.user_id
        INNER JOIN smart_meters sm ON b.meter_id = sm.meter_id
        INNER JOIN utility_companies uc ON b.utility_id = uc.utility_id
        WHERE b.due_date BETWEEN '1900-01-01' AND CURRENT_DATE
        AND b.bill_status = 'sent'
        AND b.total_amount NOT BETWEEN 0 AND 0.01
        AND (b.payment_date IS NULL OR b.payment_date > b.due_date)
        ORDER BY b.due_date ASC
      `);
      
      return bills;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, updateBillDto: UpdateBillDto): Promise<Bill> {
    const queryRunner = this.billRepository.manager.connection.createQueryRunner();
    
    try {
      // Using ANY operator in subquery
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 2;

      Object.keys(updateBillDto).forEach((key: string) => {
        const value = (updateBillDto as any)[key];
        if (value !== undefined) {
          updateFields.push(`${key} = ${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      });

      if (updateFields.length === 0) {
        return this.findOne(id);
      }

      await queryRunner.query(`
        UPDATE bills 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE bill_id = $1
        AND bill_id = ANY(
          SELECT bill_id FROM bills WHERE bill_status != 'paid'
        )
      `, [id, ...values]);

      return this.findOne(id);
    } finally {
      await queryRunner.release();
    }
  }

  async markAsPaid(id: number): Promise<Bill> {
    const queryRunner = this.billRepository.manager.connection.createQueryRunner();
    
    try {
      // Using ALL operator in subquery
      await queryRunner.query(`
        UPDATE bills 
        SET bill_status = 'paid', 
            payment_date = CURRENT_TIMESTAMP
        WHERE bill_id = $1
        AND total_amount > ALL(
          SELECT COALESCE(subsidy_amount, 0) FROM bills WHERE bill_id = $1
        )
      `, [id]);

      return this.findOne(id);
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number): Promise<void> {
    const queryRunner = this.billRepository.manager.connection.createQueryRunner();
    
    try {
      // Check if bill exists first
      await this.findOne(id);
      
      // Using EXISTS in DELETE
      const result = await queryRunner.query(`
        DELETE FROM bills 
        WHERE bill_id = $1
        AND EXISTS (
          SELECT 1 FROM bills WHERE bill_id = $1 AND bill_status != 'paid'
        )
      `, [id]);

      if (result.rowCount === 0) {
        throw new NotFoundException(`Cannot delete paid bill with ID ${id}`);
      }
    } finally {
      await queryRunner.release();
    }
  }

  async getBillSummary(userId: number, year: number) {
    const queryRunner = this.billRepository.manager.connection.createQueryRunner();
    
    try {
      // Using aggregate functions, GROUP BY, HAVING, arithmetic operators
      const result = await queryRunner.query(`
        SELECT 
          COUNT(b.bill_id) as total_bills,
          SUM(b.total_amount) as total_amount,
          SUM(b.units_consumed) as total_units,
          AVG(b.total_amount) as avg_amount,
          MIN(b.total_amount) as min_amount,
          MAX(b.total_amount) as max_amount,
          SUM(b.energy_charges + b.fixed_charges) as base_charges,
          SUM(b.peak_charges + b.off_peak_charges) as time_based_charges,
          COUNT(CASE WHEN b.bill_status = 'paid' THEN 1 END) as paid_bills,
          COUNT(CASE WHEN b.bill_status = 'overdue' THEN 1 END) as overdue_bills
        FROM bills b
        INNER JOIN users u ON b.user_id = u.user_id
        WHERE b.user_id = $1 
        AND EXTRACT(YEAR FROM b.created_at) = $2
        GROUP BY b.user_id, EXTRACT(YEAR FROM b.created_at)
        HAVING COUNT(b.bill_id) > 0
        AND SUM(b.total_amount) > 0
      `, [userId, year]);

      return result[0] || {
        total_bills: 0,
        total_amount: 0,
        total_units: 0,
        avg_amount: 0,
        min_amount: 0,
        max_amount: 0,
        base_charges: 0,
        time_based_charges: 0,
        paid_bills: 0,
        overdue_bills: 0
      };
    } finally {
      await queryRunner.release();
    }
  }

  // Additional method demonstrating SET operations (UNION, INTERSECT, EXCEPT)
  async getBillAnalytics(utilityId: number, year: number) {
    const queryRunner = this.billRepository.manager.connection.createQueryRunner();
    
    try {
      // Using UNION for set operations
      const result = await queryRunner.query(`
        -- High consumption users
        SELECT 'high_consumption' as category, user_id, SUM(units_consumed) as total_units
        FROM bills 
        WHERE utility_id = $1 AND EXTRACT(YEAR FROM created_at) = $2
        GROUP BY user_id
        HAVING SUM(units_consumed) > 1000
        
        UNION ALL
        
        -- High bill amount users  
        SELECT 'high_amount' as category, user_id, SUM(total_amount) as total_amount
        FROM bills
        WHERE utility_id = $1 AND EXTRACT(YEAR FROM created_at) = $2
        GROUP BY user_id
        HAVING SUM(total_amount) > 10000
        
        ORDER BY category, total_units DESC NULLS LAST
      `, [utilityId, year]);

      return result;
    } finally {
      await queryRunner.release();
    }
  }

  // Method demonstrating complex search with string operators
  async searchBills(searchTerm: string, userId?: number) {
    const queryRunner = this.billRepository.manager.connection.createQueryRunner();
    
    try {
      // Using various string operators and pattern matching
      const whereClause = userId ? 'AND b.user_id = $2' : '';
      const params = userId ? [searchTerm, userId] : [searchTerm];

      const bills = await queryRunner.query(`
        SELECT 
          b.*,
          u.first_name || ' ' || u.last_name as full_name,
          sm.meter_serial_number,
          uc.company_name,
          CASE 
            WHEN b.bill_number ILIKE $1 THEN 'exact_match'
            WHEN b.bill_number ILIKE CONCAT($1, '%') THEN 'prefix_match'
            WHEN b.bill_number ILIKE CONCAT('%', $1, '%') THEN 'contains_match'
            ELSE 'other_match'
          END as match_type
        FROM bills b
        INNER JOIN users u ON b.user_id = u.user_id
        INNER JOIN smart_meters sm ON b.meter_id = sm.meter_id  
        INNER JOIN utility_companies uc ON b.utility_id = uc.utility_id
        WHERE (
          b.bill_number ILIKE CONCAT('%', $1, '%')
          OR u.first_name ILIKE CONCAT('%', $1, '%')
          OR u.last_name ILIKE CONCAT('%', $1, '%')
          OR u.customer_id ILIKE CONCAT('%', $1, '%')
          OR sm.meter_serial_number ILIKE CONCAT('%', $1, '%')
        )
        ${whereClause}
        ORDER BY 
          CASE match_type
            WHEN 'exact_match' THEN 1
            WHEN 'prefix_match' THEN 2
            WHEN 'contains_match' THEN 3
            ELSE 4
          END,
          b.created_at DESC
      `, params);

      return bills;
    } finally {
      await queryRunner.release();
    }
  }

  // Method demonstrating monthly billing summary with advanced analytics
  async getMonthlyBillingSummary(utilityId: number, year: number) {
    const queryRunner = this.billRepository.manager.connection.createQueryRunner();
    
    try {
      // Using to_char, extract, window functions, and complex aggregations
      const result = await queryRunner.query(`
        SELECT 
          TO_CHAR(b.created_at, 'YYYY-MM') as billing_month,
          EXTRACT(MONTH FROM b.created_at) as month_number,
          EXTRACT(QUARTER FROM b.created_at) as quarter,
          COUNT(b.bill_id) as total_bills,
          COUNT(DISTINCT b.user_id) as unique_customers,
          SUM(b.total_amount) as total_revenue,
          AVG(b.total_amount) as avg_bill_amount,
          SUM(b.units_consumed) as total_units,
          AVG(b.units_consumed) as avg_units,
          SUM(b.energy_charges) as total_energy_charges,
          SUM(b.fixed_charges) as total_fixed_charges,
          SUM(b.peak_charges) as total_peak_charges,
          SUM(b.off_peak_charges) as total_off_peak_charges,
          SUM(b.tax_amount) as total_tax,
          SUM(b.subsidy_amount) as total_subsidy,
          COUNT(CASE WHEN b.bill_status = 'paid' THEN 1 END) as paid_count,
          COUNT(CASE WHEN b.bill_status = 'overdue' THEN 1 END) as overdue_count,
          ROUND(
            COUNT(CASE WHEN b.bill_status = 'paid' THEN 1 END) * 100.0 / COUNT(b.bill_id), 
            2
          ) as payment_percentage
        FROM bills b
        WHERE b.utility_id = $1 
        AND EXTRACT(YEAR FROM b.created_at) = $2
        GROUP BY 
          TO_CHAR(b.created_at, 'YYYY-MM'),
          EXTRACT(MONTH FROM b.created_at),
          EXTRACT(QUARTER FROM b.created_at)
        HAVING COUNT(b.bill_id) > 0
        ORDER BY month_number
      `, [utilityId, year]);

      return result;
    } finally {
      await queryRunner.release();
    }
  }
}