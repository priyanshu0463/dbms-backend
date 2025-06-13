import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UtilityCompany } from '../../entities/utility-company.entity';
import { CreateUtilityCompanyDto } from './dto/create-utility-company.dto';
import { UpdateUtilityCompanyDto } from './dto/update-utility-company.dto';

@Injectable()
export class UtilityCompaniesService {
  constructor(
    @InjectRepository(UtilityCompany)
    private utilityCompanyRepository: Repository<UtilityCompany>,
  ) {}

  async create(
    createUtilityCompanyDto: CreateUtilityCompanyDto,
  ): Promise<UtilityCompany> {
    const utilityCompany = this.utilityCompanyRepository.create(
      createUtilityCompanyDto,
    );
    return this.utilityCompanyRepository.save(utilityCompany);
  }

  async findAll(): Promise<UtilityCompany[]> {
    return this.utilityCompanyRepository.find({
      relations: ['users', 'smart_meters', 'bills'],
    });
  }

  async findOne(id: number): Promise<UtilityCompany> {
    const utilityCompany = await this.utilityCompanyRepository.findOne({
      where: { utility_id: id },
      relations: ['users', 'smart_meters', 'bills'],
    });

    if (!utilityCompany) {
      throw new NotFoundException(`Utility company with ID ${id} not found`);
    }

    return utilityCompany;
  }

  async update(id: number, updateUtilityCompanyDto: UpdateUtilityCompanyDto): Promise<UtilityCompany> {
    const utilityCompany = await this.findOne(id);
    Object.assign(utilityCompany, updateUtilityCompanyDto);
    return this.utilityCompanyRepository.save(utilityCompany);
  }

  async remove(id: number): Promise<void> {
    const utilityCompany = await this.findOne(id);
    await this.utilityCompanyRepository.remove(utilityCompany);
  }
}