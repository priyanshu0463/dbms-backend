import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { SmartMeter } from './smart-meter.entity';

export enum TodSlot {
  PEAK = 'peak',
  NORMAL = 'normal',
  OFF_PEAK = 'off_peak',
}

@Entity('meter_readings')
@Index('idx_readings_meter_time', ['meter_id', 'timestamp'])
@Index('idx_readings_quarter_season', ['quarter', 'season'])
@Index('idx_readings_analytics', ['meter_id', 'timestamp', 'energy_consumed'])
export class MeterReading {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  reading_id: number;

  @Column()
  meter_id: number;

  @Column('timestamp')
  timestamp: Date;

  @Column('decimal', { precision: 12, scale: 4 })
  energy_consumed: number;

  @Column('decimal', { precision: 4, scale: 3, nullable: true })
  power_factor: number;

  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  voltage: number;

  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  current: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  frequency: number;

  @Column('decimal', { precision: 12, scale: 4, nullable: true })
  reactive_power: number;

  @Column('decimal', { precision: 12, scale: 4, nullable: true })
  apparent_power: number;

  @Column('smallint', { nullable: true })
  quarter: number;

  @Column('smallint', { nullable: true })
  season: number;

  @Column({
    type: 'enum',
    enum: TodSlot,
    nullable: true,
  })
  tod_slot: TodSlot;

  @CreateDateColumn()
  created_at: Date;

  // Relationships
  @ManyToOne(() => SmartMeter, (smartMeter) => smartMeter.meter_readings)
  @JoinColumn({ name: 'meter_id' })
  smart_meter: SmartMeter;
}