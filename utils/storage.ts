import { Expense, ExpenseCategory, UserSettings, UserProfile, Income } from './types';

// Default categories with colors
const DEFAULT_CATEGORIES: ExpenseCategory[] = [
  { id: '1', name: 'Food', color: '#FF5733' },
  { id: '2', name: 'Transportation', color: '#33A8FF' },
  { id: '3', name: 'Housing', color: '#33FF57' },
  { id: '4', name: 'Entertainment', color: '#C133FF' },
  { id: '5', name: 'Education', color: '#FFD133' },
  { id: '6', name: 'Health', color: '#FF33A8' },
  { id: '7', name: 'Shopping', color: '#33FFD1' },
  { id: '8', name: 'Utilities', color: '#D1FF33' },
  { id: '9', name: 'Other', color: '#808080' },
];

// Default user profile
const DEFAULT_PROFILE: UserProfile = {
  name: 'Your Name',
  currency: 'USD',
  incomes: [],
  savingsGoal: 0
};

// Default user settings
const DEFAULT_SETTINGS: UserSettings = {
  categories: DEFAULT_CATEGORIES,
  budgetLimits: {
    weekly: 300,
    monthly: 1200,
    yearly: 15000,
  },
  profile: DEFAULT_PROFILE,
  theme: 'light'
};

// Initialize local storage with default values if nothing exists
export const initializeStorage = () => {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem('expenses')) {
    localStorage.setItem('expenses', JSON.stringify([]));
  }

  if (!localStorage.getItem('userSettings')) {
    localStorage.setItem('userSettings', JSON.stringify(DEFAULT_SETTINGS));
  }
};

// Reset all data to defaults
export const resetAllData = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('expenses', JSON.stringify([]));
  localStorage.setItem('userSettings', JSON.stringify(DEFAULT_SETTINGS));
};

// Get all expenses
export const getExpenses = (): Expense[] => {
  if (typeof window === 'undefined') return [];
  const expenses = localStorage.getItem('expenses');
  return expenses ? JSON.parse(expenses) : [];
};

// Save an expense
export const saveExpense = (expense: Expense): void => {
  if (typeof window === 'undefined') return;
  const expenses = getExpenses();
  expenses.push(expense);
  localStorage.setItem('expenses', JSON.stringify(expenses));
};

// Update an expense
export const updateExpense = (updatedExpense: Expense): void => {
  if (typeof window === 'undefined') return;
  const expenses = getExpenses();
  const index = expenses.findIndex((exp) => exp.id === updatedExpense.id);
  
  if (index !== -1) {
    expenses[index] = updatedExpense;
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }
};

// Delete an expense
export const deleteExpense = (id: string): void => {
  if (typeof window === 'undefined') return;
  const expenses = getExpenses();
  const filteredExpenses = expenses.filter((expense) => expense.id !== id);
  localStorage.setItem('expenses', JSON.stringify(filteredExpenses));
};

// Get user settings
export const getUserSettings = (): UserSettings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const settings = localStorage.getItem('userSettings');
  return settings ? JSON.parse(settings) : DEFAULT_SETTINGS;
};

// Update user settings
export const updateUserSettings = (settings: UserSettings): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('userSettings', JSON.stringify(settings));
};

// Add a new category
export const addCategory = (category: ExpenseCategory): void => {
  if (typeof window === 'undefined') return;
  const settings = getUserSettings();
  settings.categories.push(category);
  updateUserSettings(settings);
};

// Update a category
export const updateCategory = (updatedCategory: ExpenseCategory): void => {
  if (typeof window === 'undefined') return;
  const settings = getUserSettings();
  const index = settings.categories.findIndex((cat) => cat.id === updatedCategory.id);
  
  if (index !== -1) {
    settings.categories[index] = updatedCategory;
    updateUserSettings(settings);
  }
};

// Delete a category
export const deleteCategory = (id: string): void => {
  if (typeof window === 'undefined') return;
  const settings = getUserSettings();
  settings.categories = settings.categories.filter((cat) => cat.id !== id);
  updateUserSettings(settings);
};

// Get user profile
export const getUserProfile = (): UserProfile => {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  const settings = getUserSettings();
  return settings.profile || DEFAULT_PROFILE;
};

// Update user profile
export const updateUserProfile = (profile: UserProfile): void => {
  if (typeof window === 'undefined') return;
  const settings = getUserSettings();
  settings.profile = profile;
  updateUserSettings(settings);
};

// Add income
export const addIncome = (income: Income): void => {
  if (typeof window === 'undefined') return;
  const settings = getUserSettings();
  settings.profile.incomes.push(income);
  updateUserSettings(settings);
};

// Update income
export const updateIncome = (updatedIncome: Income): void => {
  if (typeof window === 'undefined') return;
  const settings = getUserSettings();
  const index = settings.profile.incomes.findIndex((inc) => inc.id === updatedIncome.id);
  
  if (index !== -1) {
    settings.profile.incomes[index] = updatedIncome;
    updateUserSettings(settings);
  }
};

// Delete income
export const deleteIncome = (id: string): void => {
  if (typeof window === 'undefined') return;
  const settings = getUserSettings();
  settings.profile.incomes = settings.profile.incomes.filter((inc) => inc.id !== id);
  updateUserSettings(settings);
}; 