import { useState, useEffect } from 'react';
import { 
  getUserSettings, 
  updateUserSettings, 
  addCategory, 
  updateCategory, 
  deleteCategory 
} from '../utils/storage';
import { generateId } from '../utils/helpers';
import { ExpenseCategory, UserSettings } from '../utils/types';

export const useSettings = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    const loadedSettings = getUserSettings();
    setSettings(loadedSettings);
    setLoading(false);
  }, []);

  // Update budget limits
  const updateBudgetLimits = (
    limits: {
      weekly?: number,
      monthly?: number,
      yearly?: number,
    }
  ) => {
    if (!settings) return null;

    const updatedSettings = {
      ...settings,
      budgetLimits: {
        ...settings.budgetLimits,
        ...limits,
      },
    };

    // Save to storage
    updateUserSettings(updatedSettings);

    // Update state
    setSettings(updatedSettings);

    return updatedSettings;
  };

  // Add a new category
  const createCategory = (
    name: string,
    color: string
  ) => {
    if (!settings) return null;

    // Create new category
    const newCategory: ExpenseCategory = {
      id: generateId(),
      name,
      color,
    };

    // Save to storage
    addCategory(newCategory);

    // Update state
    const updatedSettings = {
      ...settings,
      categories: [...settings.categories, newCategory],
    };
    setSettings(updatedSettings);

    return newCategory;
  };

  // Update a category
  const editCategory = (
    id: string,
    updates: {
      name?: string,
      color?: string,
    }
  ) => {
    if (!settings) return null;

    const categoryIndex = settings.categories.findIndex(cat => cat.id === id);
    
    if (categoryIndex === -1) {
      return null;
    }
    
    const updatedCategory = {
      ...settings.categories[categoryIndex],
      ...updates,
    };
    
    // Save to storage
    updateCategory(updatedCategory);
    
    // Update state
    const newCategories = [...settings.categories];
    newCategories[categoryIndex] = updatedCategory;
    
    const updatedSettings = {
      ...settings,
      categories: newCategories,
    };
    setSettings(updatedSettings);
    
    return updatedCategory;
  };

  // Remove a category
  const removeCategory = (id: string) => {
    if (!settings) return null;

    // Remove from storage
    deleteCategory(id);
    
    // Update state
    const updatedSettings = {
      ...settings,
      categories: settings.categories.filter(cat => cat.id !== id),
    };
    setSettings(updatedSettings);
  };

  return {
    settings,
    loading,
    updateBudgetLimits,
    createCategory,
    editCategory,
    removeCategory,
  };
}; 