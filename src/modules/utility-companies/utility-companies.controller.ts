import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { UtilityCompaniesService } from './utility-companies.service';
import { CreateUtilityCompanyDto } from './dto/create-utility-company.dto';
import { UpdateUtilityCompanyDto } from './dto/update-utility-company.dto';

@Controller('utility-companies')
export class UtilityCompaniesController {
  constructor(
    private readonly utilityCompaniesService: UtilityCompaniesService,
  ) {}

  @Post()
  create(@Body() createUtilityCompanyDto: CreateUtilityCompanyDto) {
    return this.utilityCompaniesService.create(createUtilityCompanyDto);
  }

  @Get()
  findAll() {
    return this.utilityCompaniesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.utilityCompaniesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUtilityCompanyDto: UpdateUtilityCompanyDto,
  ) {
    return this.utilityCompaniesService.update(id, updateUtilityCompanyDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.utilityCompaniesService.remove(id);
  }
}
