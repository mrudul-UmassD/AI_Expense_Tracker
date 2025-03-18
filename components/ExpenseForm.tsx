'use client';

import { useState, useEffect } from 'react';
import { ExpenseCategory } from '../utils/types';
import { getCurrentDateISO } from '../utils/helpers';

type RecurringType = {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate?: string;
  endDate?: string;
};

type ExpenseFormProps = {
  onSubmit: (data: {
    amount: number;
    description: string;
    category: string;
    date: string;
    recurring?: RecurringType;
  }) => void;
  onCancel: () => void;
  categories: ExpenseCategory[];
  initialData?: {
    amount: number;
    description: string;
    category: string;
    date: string;
    recurring?: RecurringType;
  };
  currency?: string;
};

export default function ExpenseForm({
  onSubmit,
  onCancel,
  categories,
  initialData,
  currency = 'USD',
}: ExpenseFormProps) {
  const [amount, setAmount] = useState(initialData?.amount || 0);
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || (categories[0]?.id || ''));
  const [date, setDate] = useState(initialData?.date || getCurrentDateISO());
  const [isRecurring, setIsRecurring] = useState(!!initialData?.recurring);
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>(
    initialData?.recurring?.frequency || 'monthly'
  );
  const [recurringEndDate, setRecurringEndDate] = useState(initialData?.recurring?.endDate || '');

  // Get currency symbol
  const getCurrencySymbol = (currency: string): string => {
    switch (currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      case 'CAD': return 'C$';
      case 'AUD': return 'A$';
      case 'INR': return '₹';
      default: return '$';
    }
  };

  // Update category if initial categories change
  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].id);
    }
  }, [categories, category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (amount <= 0) {
      alert('Amount must be greater than 0');
      return;
    }
    
    if (!description.trim()) {
      alert('Please enter a description');
      return;
    }
    
    // Create expense data object
    const expenseData = {
      amount,
      description,
      category,
      date,
      ...(isRecurring && {
        recurring: {
          frequency: recurringFrequency,
          startDate: date,
          ...(recurringEndDate && { endDate: recurringEndDate }),
        },
      }),
    };
    
    onSubmit(expenseData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="amount" className="label">
          Amount ({getCurrencySymbol(currency)})
        </label>
        <input
          type="number"
          id="amount"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
          className="input"
          required
        />
      </div>
      
      <div>
        <label htmlFor="description" className="label">
          Description
        </label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input"
          required
        />
      </div>
      
      <div>
        <label htmlFor="category" className="label">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="select"
          required
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="date" className="label">
          Date
        </label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input"
          required
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isRecurring"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          This is a recurring expense
        </label>
      </div>
      
      {isRecurring && (
        <div className="space-y-4 pl-6 border-l-2 border-gray-200 dark:border-gray-700">
          <div>
            <label htmlFor="recurringFrequency" className="label">
              Frequency
            </label>
            <select
              id="recurringFrequency"
              value={recurringFrequency}
              onChange={(e) => setRecurringFrequency(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly')}
              className="select"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="recurringEndDate" className="label">
              End Date (Optional)
            </label>
            <input
              type="date"
              id="recurringEndDate"
              value={recurringEndDate}
              onChange={(e) => setRecurringEndDate(e.target.value)}
              className="input"
              min={date}
            />
          </div>
        </div>
      )}
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
        >
          Save Expense
        </button>
      </div>
    </form>
  );
} 