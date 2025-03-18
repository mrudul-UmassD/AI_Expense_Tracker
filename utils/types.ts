export type Expense = {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string; // ISO string format
  recurring?: RecurringExpense;
};

export type RecurringExpense = {
  id: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string; // ISO string format
  endDate?: string; // ISO string format (optional)
};

export type ExpenseCategory = {
  id: string;
  name: string;
  color: string;
};

export type UserSettings = {
  categories: ExpenseCategory[];
  budgetLimits: {
    weekly?: number;
    monthly?: number;
    yearly?: number;
  };
};

export type ExpenseAnalytics = {
  totalSpent: number;
  categoriesBreakdown: {
    [category: string]: number;
  };
  timeSeriesData: {
    labels: string[];
    values: number[];
  };
  rating: number; // 1-5 rating based on spending habits
  message: string; // feedback message based on spending habits
}; 