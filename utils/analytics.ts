import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, isWithinInterval } from 'date-fns';
import { Expense, ExpenseAnalytics, UserSettings } from './types';
import { getExpenses, getUserSettings } from './storage';

// Helper to get expenses within a date range
const getExpensesInRange = (startDate: Date, endDate: Date): Expense[] => {
  const expenses = getExpenses();
  return expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return isWithinInterval(expenseDate, { start: startDate, end: endDate });
  });
};

// Generate weekly analytics
export const getWeeklyAnalytics = (): ExpenseAnalytics => {
  const today = new Date();
  const start = startOfWeek(today, { weekStartsOn: 0 });
  const end = endOfWeek(today, { weekStartsOn: 0 });
  const expenses = getExpensesInRange(start, end);
  
  return generateAnalytics(expenses, 'weekly', start, end);
};

// Generate monthly analytics
export const getMonthlyAnalytics = (): ExpenseAnalytics => {
  const today = new Date();
  const start = startOfMonth(today);
  const end = endOfMonth(today);
  const expenses = getExpensesInRange(start, end);
  
  return generateAnalytics(expenses, 'monthly', start, end);
};

// Generate yearly analytics
export const getYearlyAnalytics = (): ExpenseAnalytics => {
  const today = new Date();
  const start = startOfYear(today);
  const end = endOfYear(today);
  const expenses = getExpensesInRange(start, end);
  
  return generateAnalytics(expenses, 'yearly', start, end);
};

// Generate the detailed analytics
const generateAnalytics = (
  expenses: Expense[],
  period: 'weekly' | 'monthly' | 'yearly',
  startDate: Date,
  endDate: Date
): ExpenseAnalytics => {
  // Calculate total spent
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate categories breakdown
  const categoriesBreakdown: { [category: string]: number } = {};
  expenses.forEach(expense => {
    if (!categoriesBreakdown[expense.category]) {
      categoriesBreakdown[expense.category] = 0;
    }
    categoriesBreakdown[expense.category] += expense.amount;
  });
  
  // Generate time series data based on the period
  let labels: string[] = [];
  let timeIntervals: Date[] = [];
  
  if (period === 'weekly') {
    // For weekly, show each day
    timeIntervals = eachDayOfInterval({ start: startDate, end: endDate });
    labels = timeIntervals.map(date => format(date, 'EEE'));
  } else if (period === 'monthly') {
    // For monthly, show each week
    timeIntervals = eachWeekOfInterval(
      { start: startDate, end: endDate },
      { weekStartsOn: 0 }
    );
    labels = timeIntervals.map((date, index) => `Week ${index + 1}`);
  } else if (period === 'yearly') {
    // For yearly, show each month
    timeIntervals = eachMonthOfInterval({ start: startDate, end: endDate });
    labels = timeIntervals.map(date => format(date, 'MMM'));
  }
  
  // Calculate values for each time interval
  const values = timeIntervals.map((intervalStart, index) => {
    let intervalEnd: Date;
    
    if (period === 'weekly') {
      intervalEnd = intervalStart;
    } else if (period === 'monthly') {
      intervalEnd = index < timeIntervals.length - 1 
        ? new Date(timeIntervals[index + 1].getTime() - 1) 
        : endDate;
    } else { // yearly
      intervalEnd = index < timeIntervals.length - 1 
        ? new Date(new Date(timeIntervals[index + 1]).setDate(0)) 
        : endDate;
    }
    
    const intervalExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return isWithinInterval(expenseDate, { start: intervalStart, end: intervalEnd });
    });
    
    return intervalExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  });
  
  // Calculate rating and message based on spending habits
  const { rating, message } = calculateRating(totalSpent, period);
  
  return {
    totalSpent,
    categoriesBreakdown,
    timeSeriesData: { labels, values },
    rating,
    message,
  };
};

// Calculate a rating based on spending habits
const calculateRating = (
  totalSpent: number, 
  period: 'weekly' | 'monthly' | 'yearly'
): { rating: number; message: string } => {
  const settings = getUserSettings();
  const budgetLimit = settings.budgetLimits[period] || 0;
  
  if (budgetLimit === 0) {
    return { 
      rating: 3,
      message: "Set a budget limit to get personalized spending feedback."
    };
  }
  
  // Calculate percentage of budget used
  const percentUsed = (totalSpent / budgetLimit) * 100;
  
  // Determine rating (1-5) and message based on percentage
  if (percentUsed <= 50) {
    return { 
      rating: 5,
      message: "Excellent! You're well under your budget. Keep it up!"
    };
  } else if (percentUsed <= 75) {
    return { 
      rating: 4,
      message: "Great job! You're managing your spending well."
    };
  } else if (percentUsed <= 90) {
    return { 
      rating: 3,
      message: "Good, but keep an eye on your spending to stay within budget."
    };
  } else if (percentUsed <= 100) {
    return { 
      rating: 2,
      message: "Caution! You're approaching your budget limit."
    };
  } else {
    return { 
      rating: 1,
      message: "Alert! You've exceeded your budget. Try to reduce spending."
    };
  }
};

// Detect category based on expense description
export const detectCategory = (description: string): string => {
  const settings = getUserSettings();
  const categories = settings.categories;
  
  // Simple keyword-based category detection
  const descLower = description.toLowerCase();
  
  // Check for food-related keywords
  if (/food|grocery|restaurant|cafe|coffee|pizza|burger|lunch|dinner|breakfast|meal|snack/i.test(descLower)) {
    return categories.find(cat => cat.name.toLowerCase() === 'food')?.id || categories[0].id;
  }
  
  // Check for transportation-related keywords
  if (/gas|fuel|bus|train|uber|lyft|taxi|car|vehicle|transport|travel|flight|airline/i.test(descLower)) {
    return categories.find(cat => cat.name.toLowerCase() === 'transportation')?.id || categories[1].id;
  }
  
  // Check for housing-related keywords
  if (/rent|mortgage|apartment|house|housing|maintenance|repair|furniture|utilities|electricity|water|internet/i.test(descLower)) {
    return categories.find(cat => cat.name.toLowerCase() === 'housing')?.id || categories[2].id;
  }
  
  // Check for entertainment-related keywords
  if (/movie|theatre|game|concert|music|netflix|spotify|hulu|disney|entertainment|party/i.test(descLower)) {
    return categories.find(cat => cat.name.toLowerCase() === 'entertainment')?.id || categories[3].id;
  }
  
  // Check for education-related keywords
  if (/tuition|school|college|university|course|book|textbook|education|class|seminar|workshop|training/i.test(descLower)) {
    return categories.find(cat => cat.name.toLowerCase() === 'education')?.id || categories[4].id;
  }
  
  // Check for health-related keywords
  if (/doctor|hospital|clinic|medicine|pharmacy|health|medical|dental|vision|insurance|therapy/i.test(descLower)) {
    return categories.find(cat => cat.name.toLowerCase() === 'health')?.id || categories[5].id;
  }
  
  // Check for shopping-related keywords
  if (/shopping|clothes|clothing|shoes|accessory|electronics|gadget|amazon|walmart|target|store/i.test(descLower)) {
    return categories.find(cat => cat.name.toLowerCase() === 'shopping')?.id || categories[6].id;
  }
  
  // Check for utilities-related keywords
  if (/utility|bill|phone|cellphone|mobile|subscription/i.test(descLower)) {
    return categories.find(cat => cat.name.toLowerCase() === 'utilities')?.id || categories[7].id;
  }
  
  // Default to Other if no match is found
  return categories.find(cat => cat.name.toLowerCase() === 'other')?.id || categories[8].id;
}; 