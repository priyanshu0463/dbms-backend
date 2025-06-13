import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { UtilityCompany } from './utility-company.entity';
import { SmartMeter } from './smart-meter.entity';
import { Bill } from './bill.entity';

export enum ConnectionType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  INDUSTRIAL = 'industrial',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ length: 50, unique: true })
  customer_id: string;

  @Column({ length: 100 })
  first_name: string;

  @Column({ length: 100 })
  last_name: string;

  @Column({ length: 255, unique: true, nullable: true })
  email: string;

  @Column({ length: 15, nullable: true })
  phone: string;

  @Column('text', { nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  state: string;

  @Column({ length: 10, nullable: true })
  pincode: string;

  @Column()
  utility_id: number;

  @Column({
    type: 'enum',
    enum: ConnectionType,
  })
  connection_type: ConnectionType;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  connection_load: number;

  @Column({ length: 50, nullable: true })
  tariff_category: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relationships
  @ManyToOne(() => UtilityCompany, (utilityCompany) => utilityCompany.users)
  @JoinColumn({ name: 'utility_id' })
  utility_company: UtilityCompany;

  @OneToMany(() => SmartMeter, (smartMeter) => smartMeter.user)
  smart_meters: SmartMeter[];

  @OneToMany(() => Bill, (bill) => bill.user)
  bills: Bill[];
}