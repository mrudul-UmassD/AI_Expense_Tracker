import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, isWithinInterval, differenceInMonths, differenceInWeeks, differenceInDays } from 'date-fns';
import { Expense, ExpenseAnalytics, UserSettings, SpendingSuggestion, Income } from './types';
import { getExpenses, getUserSettings } from './storage';
import { generateId } from './helpers';

// Helper to get expenses within a date range
const getExpensesInRange = (startDate: Date, endDate: Date): Expense[] => {
  const expenses = getExpenses();
  return expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return isWithinInterval(expenseDate, { start: startDate, end: endDate });
  });
};

// Calculate total income for a period
const calculateTotalIncome = (
  incomes: Income[],
  startDate: Date,
  endDate: Date
): number => {
  let totalIncome = 0;

  incomes.forEach(income => {
    const incomeStartDate = new Date(income.startDate);
    const incomeEndDate = income.endDate ? new Date(income.endDate) : null;
    
    // Skip if income starts after the period ends or ends before the period starts
    if (
      incomeStartDate > endDate ||
      (incomeEndDate && incomeEndDate < startDate)
    ) {
      return;
    }
    
    // Calculate income based on frequency
    switch (income.frequency) {
      case 'one-time':
        // Only count if the one-time income falls within the period
        if (isWithinInterval(incomeStartDate, { start: startDate, end: endDate })) {
          totalIncome += income.amount;
        }
        break;
      
      case 'weekly':
        // Calculate how many weeks the income applies within the period
        const startWeek = Math.max(0, differenceInWeeks(startDate, incomeStartDate));
        const endWeek = incomeEndDate 
          ? differenceInWeeks(incomeEndDate, incomeStartDate)
          : differenceInWeeks(endDate, incomeStartDate);
        const weeksInPeriod = Math.max(0, endWeek - startWeek + 1);
        totalIncome += income.amount * weeksInPeriod;
        break;
      
      case 'bi-weekly':
        // Similar to weekly but divide the weeks by 2
        const startBiWeek = Math.floor(Math.max(0, differenceInWeeks(startDate, incomeStartDate)) / 2);
        const endBiWeek = incomeEndDate 
          ? Math.floor(differenceInWeeks(incomeEndDate, incomeStartDate) / 2)
          : Math.floor(differenceInWeeks(endDate, incomeStartDate) / 2);
        const biWeeksInPeriod = Math.max(0, endBiWeek - startBiWeek + 1);
        totalIncome += income.amount * biWeeksInPeriod;
        break;
      
      case 'monthly':
        // Calculate how many months the income applies within the period
        const startMonth = Math.max(0, differenceInMonths(startDate, incomeStartDate));
        const endMonth = incomeEndDate 
          ? differenceInMonths(incomeEndDate, incomeStartDate)
          : differenceInMonths(endDate, incomeStartDate);
        const monthsInPeriod = Math.max(0, endMonth - startMonth + 1);
        totalIncome += income.amount * monthsInPeriod;
        break;
      
      case 'yearly':
        // For yearly income, calculate the proportion that falls within the period
        // This is a simplified calculation, assumes even distribution across the year
        const daysInPeriod = differenceInDays(endDate, startDate) + 1;
        const daysInYear = 365;
        const yearlyProportion = daysInPeriod / daysInYear;
        totalIncome += income.amount * yearlyProportion;
        break;
    }
  });

  return totalIncome;
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
  const settings = getUserSettings();
  const incomes = settings.profile.incomes;
  
  // Calculate total spent
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate total income for the period
  const totalIncome = calculateTotalIncome(incomes, startDate, endDate);
  
  // Calculate savings rate
  const savingsRate = totalIncome > 0 
    ? Math.max(0, ((totalIncome - totalSpent) / totalIncome) * 100) 
    : 0;
  
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
  const { rating, message } = calculateRating(totalSpent, totalIncome, period);
  
  // Generate spending suggestions
  const suggestions = generateSpendingSuggestions(
    expenses, 
    categoriesBreakdown, 
    totalSpent, 
    totalIncome, 
    settings
  );
  
  return {
    totalSpent,
    totalIncome,
    savingsRate,
    categoriesBreakdown,
    timeSeriesData: { labels, values },
    rating,
    message,
    suggestions
  };
};

// Calculate a rating based on spending habits
const calculateRating = (
  totalSpent: number, 
  totalIncome: number,
  period: 'weekly' | 'monthly' | 'yearly'
): { rating: number; message: string } => {
  const settings = getUserSettings();
  const budgetLimit = settings.budgetLimits[period] || 0;
  
  // If we have income, use that as the primary factor for rating
  if (totalIncome > 0) {
    const spendingRatio = totalSpent / totalIncome * 100;
    
    if (spendingRatio <= 50) {
      return { 
        rating: 5,
        message: "Excellent! You're saving more than half of your income."
      };
    } else if (spendingRatio <= 70) {
      return { 
        rating: 4,
        message: "Great job! You're saving a good portion of your income."
      };
    } else if (spendingRatio <= 90) {
      return { 
        rating: 3,
        message: "Good, but try to increase your savings rate if possible."
      };
    } else if (spendingRatio <= 100) {
      return { 
        rating: 2,
        message: "Caution! You're spending almost all your income."
      };
    } else {
      return { 
        rating: 1,
        message: "Alert! You're spending more than you earn. Review your expenses."
      };
    }
  }
  
  // Fallback to budget-based rating if no income data
  if (budgetLimit === 0) {
    return { 
      rating: 3,
      message: "Set a budget limit or add income data to get personalized feedback."
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

// Generate spending suggestions based on expenses and income
const generateSpendingSuggestions = (
  expenses: Expense[],
  categoriesBreakdown: { [category: string]: number },
  totalSpent: number,
  totalIncome: number,
  settings: UserSettings
): SpendingSuggestion[] => {
  const suggestions: SpendingSuggestion[] = [];
  const categories = settings.categories;
  
  // If no expenses, return basic suggestion
  if (expenses.length === 0) {
    suggestions.push({
      id: generateId(),
      type: 'allocation',
      description: 'Start tracking your expenses to receive personalized suggestions.',
      priority: 'medium'
    });
    return suggestions;
  }
  
  // If spending exceeds income
  if (totalIncome > 0 && totalSpent > totalIncome) {
    suggestions.push({
      id: generateId(),
      type: 'reduction',
      description: 'Your spending exceeds your income. Consider reducing expenses or finding additional income sources.',
      priority: 'high'
    });
  }
  
  // If savingsGoal is set, suggest ways to reach it
  if (settings.profile.savingsGoal && totalIncome > 0) {
    const currentSavings = totalIncome - totalSpent;
    const savingsGoal = settings.profile.savingsGoal;
    
    if (currentSavings < savingsGoal) {
      suggestions.push({
        id: generateId(),
        type: 'saving',
        description: `To reach your savings goal of ${savingsGoal}, you need to save ${savingsGoal - currentSavings} more.`,
        potentialSavings: savingsGoal - currentSavings,
        priority: 'high'
      });
    }
  }
  
  // Sort categories by amount spent
  const sortedCategories = Object.entries(categoriesBreakdown)
    .sort(([, a], [, b]) => b - a);
  
  // Suggest reducing spending in the highest spending category
  if (sortedCategories.length > 0) {
    const [topCategoryId, topAmount] = sortedCategories[0];
    const topCategory = categories.find(c => c.id === topCategoryId);
    
    if (topCategory && (totalIncome === 0 || topAmount > totalIncome * 0.3)) {
      suggestions.push({
        id: generateId(),
        type: 'reduction',
        category: topCategoryId,
        description: `Your highest expense is in ${topCategory.name}. Consider ways to reduce spending in this category.`,
        potentialSavings: topAmount * 0.2, // Suggest saving 20% of the top category
        priority: 'medium'
      });
    }
  }
  
  // For low priority, add general financial advice based on spending patterns
  if (totalSpent > 0) {
    // If food spending is high
    const foodCategoryId = categories.find(c => c.name.toLowerCase() === 'food')?.id;
    if (foodCategoryId && categoriesBreakdown[foodCategoryId]) {
      const foodPercentage = (categoriesBreakdown[foodCategoryId] / totalSpent) * 100;
      
      if (foodPercentage > 30) {
        suggestions.push({
          id: generateId(),
          type: 'saving',
          category: foodCategoryId,
          description: 'Consider meal planning and cooking at home more often to reduce food expenses.',
          potentialSavings: categoriesBreakdown[foodCategoryId] * 0.3,
          priority: 'low'
        });
      }
    }
    
    // If entertainment spending is high
    const entertainmentCategoryId = categories.find(c => c.name.toLowerCase() === 'entertainment')?.id;
    if (entertainmentCategoryId && categoriesBreakdown[entertainmentCategoryId]) {
      const entertainmentPercentage = (categoriesBreakdown[entertainmentCategoryId] / totalSpent) * 100;
      
      if (entertainmentPercentage > 15) {
        suggestions.push({
          id: generateId(),
          type: 'saving',
          category: entertainmentCategoryId,
          description: 'Look for free or lower-cost entertainment options to reduce expenses.',
          potentialSavings: categoriesBreakdown[entertainmentCategoryId] * 0.4,
          priority: 'low'
        });
      }
    }
  }
  
  // If no specific suggestions were generated, add a generic one
  if (suggestions.length === 0) {
    suggestions.push({
      id: generateId(),
      type: 'allocation',
      description: 'Consider setting a budget for each category to better manage your expenses.',
      priority: 'medium'
    });
  }
  
  return suggestions;
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