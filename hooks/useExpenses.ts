import { useState, useEffect } from 'react';
import { 
  getExpenses, 
  saveExpense, 
  updateExpense, 
  deleteExpense 
} from '../utils/storage';
import { detectCategory } from '../utils/analytics';
import { generateId, getCurrentDateISO } from '../utils/helpers';
import { Expense, RecurringExpense } from '../utils/types';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Load expenses on mount
  useEffect(() => {
    const loadedExpenses = getExpenses();
    setExpenses(loadedExpenses);
    setLoading(false);
  }, []);

  // Add a new expense
  const addExpense = (
    amount: number, 
    description: string, 
    date: string = getCurrentDateISO(),
    category?: string,
    recurring?: {
      frequency: 'daily' | 'weekly' | 'monthly' | 'yearly',
      startDate?: string,
      endDate?: string
    }
  ) => {
    // Detect category if not provided
    const detectedCategory = category || detectCategory(description);

    // Create new expense object
    const newExpense: Expense = {
      id: generateId(),
      amount,
      description,
      category: detectedCategory,
      date,
    };

    // Add recurring info if provided
    if (recurring) {
      newExpense.recurring = {
        id: generateId(),
        frequency: recurring.frequency,
        startDate: recurring.startDate || date,
        endDate: recurring.endDate,
      };
    }

    // Save to storage
    saveExpense(newExpense);
    
    // Update state
    setExpenses(prevExpenses => [...prevExpenses, newExpense]);
    
    return newExpense;
  };

  // Update an existing expense
  const editExpense = (
    id: string,
    updates: {
      amount?: number,
      description?: string,
      category?: string,
      date?: string,
      recurring?: RecurringExpense | null
    }
  ) => {
    const expenseIndex = expenses.findIndex(exp => exp.id === id);
    
    if (expenseIndex === -1) {
      return null;
    }
    
    const updatedExpense = {
      ...expenses[expenseIndex],
      ...updates,
    };
    
    // Handle removing recurring if it's set to null
    if (updates.recurring === null) {
      delete updatedExpense.recurring;
    }
    
    // Save to storage
    updateExpense(updatedExpense);
    
    // Update state
    const newExpenses = [...expenses];
    newExpenses[expenseIndex] = updatedExpense;
    setExpenses(newExpenses);
    
    return updatedExpense;
  };

  // Remove an expense
  const removeExpense = (id: string) => {
    // Remove from storage
    deleteExpense(id);
    
    // Update state
    setExpenses(prevExpenses => prevExpenses.filter(exp => exp.id !== id));
  };

  return {
    expenses,
    loading,
    addExpense,
    editExpense,
    removeExpense,
  };
}; 