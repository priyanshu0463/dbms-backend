import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { UtilityCompany } from './utility-company.entity';
import { MeterReading } from './meter-reading.entity';
import { Bill } from './bill.entity';

export enum MeterStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  FAULTY = 'faulty',
  MAINTENANCE = 'maintenance',
}

@Entity('smart_meters')
export class SmartMeter {
  @PrimaryGeneratedColumn()
  meter_id: number;

  @Column({ length: 100, unique: true })
  meter_serial_number: string;

  @Column()
  user_id: number;

  @Column()
  utility_id: number;

  @Column({ length: 50, nullable: true })
  meter_type: string;

  @Column({ length: 100, nullable: true })
  manufacturer: string;

  @Column({ length: 100, nullable: true })
  model: string;

  @Column('date', { nullable: true })
  installation_date: Date;

  @Column('date', { nullable: true })
  last_calibration_date: Date;

  @Column('date', { nullable: true })
  next_calibration_date: Date;

  @Column({
    type: 'enum',
    enum: MeterStatus,
    default: MeterStatus.ACTIVE,
  })
  status: MeterStatus;

  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  longitude: number;

  @CreateDateColumn()
  created_at: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.smart_meters)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => UtilityCompany, (utilityCompany) => utilityCompany.smart_meters)
  @JoinColumn({ name: 'utility_id' })
  utility_company: UtilityCompany;

  @OneToMany(() => MeterReading, (meterReading) => meterReading.smart_meter)
  meter_readings: MeterReading[];

  @OneToMany(() => Bill, (bill) => bill.smart_meter)
  bills: Bill[];
}