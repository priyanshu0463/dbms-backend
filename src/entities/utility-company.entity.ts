import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { SmartMeter } from './smart-meter.entity';
import { Bill } from './bill.entity';

export enum UtilityType {
  DISCOM = 'DISCOM',
  SEB = 'SEB',
  Municipality = 'Municipality',
}

@Entity('utility_companies')
export class UtilityCompany {
  @PrimaryGeneratedColumn()
  utility_id: number;

  @Column({ length: 255 })
  company_name: string;

  @Column({ length: 50, unique: true })
  company_code: string;

  @Column({
    type: 'enum',
    enum: UtilityType,
  })
  type: UtilityType;

  @Column({ length: 100, nullable: true })
  state: string;

  @Column({ length: 100, nullable: true })
  region: string;

  @Column({ length: 255, nullable: true })
  contact_email: string;

  @Column({ length: 15, nullable: true })
  contact_phone: string;

  @Column({ length: 100, nullable: true })
  regulatory_body: string;

  @CreateDateColumn()
  created_at: Date;

  // Relationships
  @OneToMany(() => User, (user) => user.utility_company)
  users: User[];

  @OneToMany(() => SmartMeter, (smartMeter) => smartMeter.utility_company)
  smart_meters: SmartMeter[];

  @OneToMany(() => Bill, (bill) => bill.utility_company)
  bills: Bill[];
}