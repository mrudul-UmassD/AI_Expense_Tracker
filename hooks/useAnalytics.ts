import { useState, useEffect } from 'react';
import { 
  getWeeklyAnalytics, 
  getMonthlyAnalytics, 
  getYearlyAnalytics 
} from '../utils/analytics';
import { ExpenseAnalytics } from '../utils/types';
import { useExpenses } from './useExpenses';

export const useAnalytics = () => {
  const [weeklyAnalytics, setWeeklyAnalytics] = useState<ExpenseAnalytics | null>(null);
  const [monthlyAnalytics, setMonthlyAnalytics] = useState<ExpenseAnalytics | null>(null);
  const [yearlyAnalytics, setYearlyAnalytics] = useState<ExpenseAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const { expenses } = useExpenses();

  // Calculate analytics when expenses change
  useEffect(() => {
    try {
      setWeeklyAnalytics(getWeeklyAnalytics());
      setMonthlyAnalytics(getMonthlyAnalytics());
      setYearlyAnalytics(getYearlyAnalytics());
    } catch (error) {
      console.error('Error calculating analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [expenses]);

  return {
    weeklyAnalytics,
    monthlyAnalytics,
    yearlyAnalytics,
    loading,
  };
}; 