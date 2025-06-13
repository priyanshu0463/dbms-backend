import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { BillsService } from './bills.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { BillStatus } from '../../entities/bill.entity';

@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post()
  create(@Body() createBillDto: CreateBillDto) {
    return this.billsService.create(createBillDto);
  }

  @Get()
  findAll() {
    return this.billsService.findAll();
  }

  @Get('overdue')
  findOverdueBills() {
    return this.billsService.findOverdueBills();
  }

  @Get('status/:status')
  findByStatus(@Param('status') status: BillStatus) {
    return this.billsService.findByStatus(status);
  }

  @Get('number/:billNumber')
  findByBillNumber(@Param('billNumber') billNumber: string) {
    return this.billsService.findByBillNumber(billNumber);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.billsService.findOne(id);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.billsService.findByUserId(userId);
  }

  @Get('meter/:meterId')
  findByMeterId(@Param('meterId', ParseIntPipe) meterId: number) {
    return this.billsService.findByMeterId(meterId);
  }

  @Get('utility/:utilityId')
  findByUtilityId(@Param('utilityId', ParseIntPipe) utilityId: number) {
    return this.billsService.findByUtilityId(utilityId);
  }

  @Get('user/:userId/summary')
  getBillSummary(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.billsService.getBillSummary(userId, year);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateBillDto: UpdateBillDto) {
    return this.billsService.update(id, updateBillDto);
  }

  @Patch(':id/pay')
  markAsPaid(@Param('id', ParseIntPipe) id: number) {
    return this.billsService.markAsPaid(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.billsService.remove(id);
  }
}
