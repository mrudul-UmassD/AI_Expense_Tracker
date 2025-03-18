import { useState, useEffect } from 'react';
import { 
  getUserProfile,
  updateUserProfile,
  addIncome,
  updateIncome,
  deleteIncome 
} from '../utils/storage';
import { generateId } from '../utils/helpers';
import { UserProfile, Income } from '../utils/types';

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load profile on mount
  useEffect(() => {
    const loadedProfile = getUserProfile();
    setProfile(loadedProfile);
    setLoading(false);
  }, []);

  // Update profile details
  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!profile) return null;

    const updatedProfile = {
      ...profile,
      ...updates,
    };

    // Save to storage
    updateUserProfile(updatedProfile);

    // Update state
    setProfile(updatedProfile);

    return updatedProfile;
  };

  // Add a new income source
  const createIncome = (
    amount: number,
    source: string,
    frequency: 'one-time' | 'weekly' | 'bi-weekly' | 'monthly' | 'yearly',
    startDate: string,
    endDate?: string
  ) => {
    if (!profile) return null;

    // Create new income
    const newIncome: Income = {
      id: generateId(),
      amount,
      source,
      frequency,
      startDate,
      endDate
    };

    // Save to storage
    addIncome(newIncome);

    // Update state
    const updatedProfile = {
      ...profile,
      incomes: [...profile.incomes, newIncome],
    };
    setProfile(updatedProfile);

    return newIncome;
  };

  // Update an income source
  const editIncome = (
    id: string,
    updates: {
      amount?: number;
      source?: string;
      frequency?: 'one-time' | 'weekly' | 'bi-weekly' | 'monthly' | 'yearly';
      startDate?: string;
      endDate?: string | null;
    }
  ) => {
    if (!profile) return null;

    const incomeIndex = profile.incomes.findIndex(inc => inc.id === id);
    
    if (incomeIndex === -1) {
      return null;
    }
    
    const updatedIncome = {
      ...profile.incomes[incomeIndex],
      ...updates,
    };
    
    // If endDate is explicitly set to null, remove it
    if (updates.endDate === null) {
      delete updatedIncome.endDate;
    }
    
    // Save to storage
    updateIncome(updatedIncome);
    
    // Update state
    const newIncomes = [...profile.incomes];
    newIncomes[incomeIndex] = updatedIncome;
    
    const updatedProfile = {
      ...profile,
      incomes: newIncomes
    };
    setProfile(updatedProfile);
    
    return updatedIncome;
  };

  // Remove an income source
  const removeIncome = (id: string) => {
    if (!profile) return null;

    // Remove from storage
    deleteIncome(id);
    
    // Update state
    const updatedProfile = {
      ...profile,
      incomes: profile.incomes.filter(inc => inc.id !== id),
    };
    setProfile(updatedProfile);
  };

  // Update savings goal
  const updateSavingsGoal = (amount: number) => {
    if (!profile) return null;

    return updateProfile({ savingsGoal: amount });
  };

  return {
    profile,
    loading,
    updateProfile,
    createIncome,
    editIncome,
    removeIncome,
    updateSavingsGoal
  };
}; 