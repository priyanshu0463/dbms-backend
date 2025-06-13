import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilityCompaniesService } from './utility-companies.service';
import { UtilityCompaniesController } from './utility-companies.controller';
import { UtilityCompany } from '../../entities/utility-company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UtilityCompany])],
  controllers: [UtilityCompaniesController],
  providers: [UtilityCompaniesService],
  exports: [UtilityCompaniesService],
})
export class UtilityCompaniesModule {}