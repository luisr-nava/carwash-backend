import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { CurrentShopService } from 'src/auth/current-shop/current-shop.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetParamsDto } from 'src/common/dtos/params.dto';

@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(
    private readonly expensesService: ExpensesService,
    private readonly currentShop: CurrentShopService,
  ) {}
  private get shopId(): string {
    return this.currentShop.shop.id;
  }

  @Post()
  create(@Body() createExpenseDto: CreateExpenseDto) {
    return this.expensesService.createExpense(createExpenseDto, this.shopId);
  }

  @Get()
  findAll(@Query() query: GetParamsDto) {
    const { page, limit, search, dateFrom, dateTo } = query;
    return this.expensesService.findAllExpenses(
      { page, limit, search, dateFrom, dateTo },
      this.shopId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expensesService.findOneExpense(id, this.shopId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto) {
    return this.expensesService.updateExpense(
      id,
      updateExpenseDto,
      this.shopId,
    );
  }
}
