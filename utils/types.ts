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

export type UserProfile = {
  name: string;
  email?: string;
  avatar?: string;
  currency: string;
  incomes: Income[];
  savingsGoal?: number;
};

export type Income = {
  id: string;
  amount: number;
  source: string;
  frequency: 'one-time' | 'weekly' | 'bi-weekly' | 'monthly' | 'yearly';
  startDate: string; // ISO string format
  endDate?: string; // ISO string format (optional)
};

export type UserSettings = {
  categories: ExpenseCategory[];
  budgetLimits: {
    weekly?: number;
    monthly?: number;
    yearly?: number;
  };
  profile: UserProfile;
  theme: 'light' | 'dark' | 'system';
};

export type ExpenseAnalytics = {
  totalSpent: number;
  totalIncome: number;
  savingsRate: number; // percentage of income saved
  categoriesBreakdown: {
    [category: string]: number;
  };
  timeSeriesData: {
    labels: string[];
    values: number[];
  };
  rating: number; // 1-5 rating based on spending habits
  message: string; // feedback message based on spending habits
  suggestions: SpendingSuggestion[];
};

export type SpendingSuggestion = {
  id: string;
  type: 'saving' | 'reduction' | 'allocation';
  category?: string;
  description: string;
  potentialSavings?: number;
  priority: 'high' | 'medium' | 'low';
}; 