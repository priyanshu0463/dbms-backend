import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { SmartMeter } from './smart-meter.entity';
import { UtilityCompany } from './utility-company.entity';

export enum BillStatus {
  GENERATED = 'generated',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  DISPUTED = 'disputed',
}

@Entity('bills')
@Index('idx_bills_user_period', ['user_id', 'billing_period_start', 'billing_period_end'])
@Index('idx_bills_utility', ['utility_id', 'created_at'])
@Index('idx_bills_status', ['bill_status', 'due_date'])
export class Bill {
  @PrimaryGeneratedColumn()
  bill_id: number;

  @Column()
  user_id: number;

  @Column()
  meter_id: number;

  @Column()
  utility_id: number;

  @Column({ length: 100, unique: true })
  bill_number: string;

  @Column('date')
  billing_period_start: Date;

  @Column('date')
  billing_period_end: Date;

  @Column('decimal', { precision: 12, scale: 4, nullable: true })
  previous_reading: number;

  @Column('decimal', { precision: 12, scale: 4, nullable: true })
  current_reading: number;

  @Column('decimal', { precision: 12, scale: 4 })
  units_consumed: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  energy_charges: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  fixed_charges: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  peak_charges: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  off_peak_charges: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  tax_amount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  subsidy_amount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total_amount: number;

  @Column('date')
  due_date: Date;

  @Column({
    type: 'enum',
    enum: BillStatus,
    default: BillStatus.GENERATED,
  })
  bill_status: BillStatus;

  @Column('timestamp', { nullable: true })
  payment_date: Date;

  @CreateDateColumn()
  created_at: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.bills)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => SmartMeter, (smartMeter) => smartMeter.bills)
  @JoinColumn({ name: 'meter_id' })
  smart_meter: SmartMeter;

  @ManyToOne(() => UtilityCompany, (utilityCompany) => utilityCompany.bills)
  @JoinColumn({ name: 'utility_id' })
  utility_company: UtilityCompany;
}