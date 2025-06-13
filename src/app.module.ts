import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { UsersModule } from './modules/users/users.module';
import { UtilityCompaniesModule } from './modules/utility-companies/utility-companies.module';
import { BillsModule } from './modules/bills/bills.module';
import { MeterReadingsModule } from './modules/meter-readings/meter-readings.module';
import { SmartMetersModule } from './modules/smart-meters/smart-meters.module';

// Import all modules


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    UtilityCompaniesModule,
    UsersModule,
    SmartMetersModule,
    MeterReadingsModule,
    BillsModule,
  ],
})
export class AppModule {}