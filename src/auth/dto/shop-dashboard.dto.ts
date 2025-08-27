// auth/dto/shop-dashboard.dto.ts
export class ShopDashboardDto {
  shop: {
    id: string;
    name: string;
    email: string;
  };

  stats: {
    today: {
      salesTotal: number;
      expensesTotal: number;
      canceledSalesTotal: number;
      canceledExpensesTotal: number;
    };
    month: {
      salesTotal: number;
      expensesTotal: number;
      canceledSalesTotal: number;
      canceledExpensesTotal: number;
    };
    productsCount: number;
  };

  cashflowToday: {
    id?: string;
    date?: Date;
    openingCash?: number;
    closingCash?: number;
    totalSales?: number;
    totalExpenses?: number;
  } | null;

  latest: {
    products: Array<{
      id: string;
      name: string;
      price: number;
      createdAt: Date;
    }>;
    sales: Array<{
      id: string;
      total: number;
      sale_date: Date;
      is_canceled: boolean;
    }>;
    expenses: Array<{
      id: string;
      amount: number;
      expense_date: Date;
      description: string;
    }>;
  };
}
