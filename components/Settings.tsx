'use client';

import { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { ExpenseCategory } from '../utils/types';
import { formatCurrency } from '../utils/helpers';

type SettingsProps = {
  loading: boolean;
};

export default function Settings({ loading }: SettingsProps) {
  const { settings, updateBudgetLimits, createCategory, editCategory, removeCategory } = useSettings();
  
  const [weekly, setWeekly] = useState<number>(settings?.budgetLimits.weekly || 0);
  const [monthly, setMonthly] = useState<number>(settings?.budgetLimits.monthly || 0);
  const [yearly, setYearly] = useState<number>(settings?.budgetLimits.yearly || 0);
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');
  
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryColor, setEditCategoryColor] = useState('');

  // Handle budget limits update
  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateBudgetLimits({
      weekly,
      monthly,
      yearly,
    });
    
    alert('Budget limits updated successfully!');
  };

  // Handle new category creation
  const handleNewCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }
    
    createCategory(newCategoryName, newCategoryColor);
    
    // Reset form
    setNewCategoryName('');
    setNewCategoryColor('#3B82F6');
    
    alert('Category created successfully!');
  };

  // Handle category edit
  const handleEditCategoryClick = (category: ExpenseCategory) => {
    setEditingCategory(category);
    setEditCategoryName(category.name);
    setEditCategoryColor(category.color);
  };
  
  const handleEditCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCategory) return;
    
    if (!editCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }
    
    editCategory(editingCategory.id, {
      name: editCategoryName,
      color: editCategoryColor,
    });
    
    // Reset form
    setEditingCategory(null);
    setEditCategoryName('');
    setEditCategoryColor('');
    
    alert('Category updated successfully!');
  };

  // Handle category removal
  const handleRemoveCategory = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category? Any expenses with this category will need to be recategorized.')) {
      removeCategory(id);
      alert('Category removed successfully!');
    }
  };

  if (loading || !settings) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Budget Limits Section */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Budget Limits</h2>
          <p className="text-gray-600 mb-4">
            Set your budget limits for different time periods. These will be used to calculate your spending rating.
          </p>
          
          <form onSubmit={handleBudgetSubmit} className="space-y-4">
            <div>
              <label htmlFor="weekly" className="label">
                Weekly Budget Limit
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="weekly"
                  min="0"
                  step="0.01"
                  value={weekly}
                  onChange={(e) => setWeekly(parseFloat(e.target.value) || 0)}
                  className="pl-7 pr-12 input"
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">USD</span>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Current: {formatCurrency(settings.budgetLimits.weekly || 0)}
              </p>
            </div>
            
            <div>
              <label htmlFor="monthly" className="label">
                Monthly Budget Limit
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="monthly"
                  min="0"
                  step="0.01"
                  value={monthly}
                  onChange={(e) => setMonthly(parseFloat(e.target.value) || 0)}
                  className="pl-7 pr-12 input"
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">USD</span>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Current: {formatCurrency(settings.budgetLimits.monthly || 0)}
              </p>
            </div>
            
            <div>
              <label htmlFor="yearly" className="label">
                Yearly Budget Limit
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="yearly"
                  min="0"
                  step="0.01"
                  value={yearly}
                  onChange={(e) => setYearly(parseFloat(e.target.value) || 0)}
                  className="pl-7 pr-12 input"
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">USD</span>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Current: {formatCurrency(settings.budgetLimits.yearly || 0)}
              </p>
            </div>
            
            <div>
              <button type="submit" className="btn btn-primary">
                Update Budget Limits
              </button>
            </div>
          </form>
        </div>
        
        {/* Categories Section */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Categories</h2>
            <p className="text-gray-600 mb-4">
              Manage your expense categories. Categories help you organize and analyze your spending habits.
            </p>
            
            <form onSubmit={handleNewCategorySubmit} className="space-y-4">
              <div>
                <label htmlFor="newCategoryName" className="label">
                  New Category Name
                </label>
                <input
                  type="text"
                  id="newCategoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="input"
                  placeholder="e.g. Groceries, Rent, Entertainment"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="newCategoryColor" className="label">
                  Category Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    id="newCategoryColor"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="h-10 w-10 rounded cursor-pointer border-0"
                  />
                  <span className="text-sm text-gray-500">{newCategoryColor}</span>
                </div>
              </div>
              
              <div>
                <button type="submit" className="btn btn-primary">
                  Add Category
                </button>
              </div>
            </form>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-medium mb-4">Existing Categories</h3>
            <div className="space-y-3">
              {settings.categories.map((category) => (
                <div 
                  key={category.id} 
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-gray-50"
                >
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div>
                    <button
                      onClick={() => handleEditCategoryClick(category)}
                      className="text-primary-600 hover:text-primary-900 text-sm mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemoveCategory(category.id)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Edit Category</h2>
            <form onSubmit={handleEditCategorySubmit} className="space-y-4">
              <div>
                <label htmlFor="editCategoryName" className="label">
                  Category Name
                </label>
                <input
                  type="text"
                  id="editCategoryName"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="editCategoryColor" className="label">
                  Category Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    id="editCategoryColor"
                    value={editCategoryColor}
                    onChange={(e) => setEditCategoryColor(e.target.value)}
                    className="h-10 w-10 rounded cursor-pointer border-0"
                  />
                  <span className="text-sm text-gray-500">{editCategoryColor}</span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 