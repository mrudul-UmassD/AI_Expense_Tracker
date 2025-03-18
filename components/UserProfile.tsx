'use client';

import { useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { UserProfile as UserProfileType, Income } from '../utils/types';
import { formatCurrency, formatDate, getCurrentDateISO } from '../utils/helpers';

type IncomeFormType = {
  amount: number;
  source: string;
  frequency: 'one-time' | 'weekly' | 'bi-weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
};

export default function UserProfile() {
  const { 
    profile, 
    loading, 
    updateProfile, 
    createIncome, 
    editIncome, 
    removeIncome, 
    updateSavingsGoal 
  } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState(profile?.name || '');
  const [userCurrency, setUserCurrency] = useState(profile?.currency || 'USD');
  const [savingsGoal, setSavingsGoal] = useState(profile?.savingsGoal || 0);

  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);
  const [incomeForm, setIncomeForm] = useState<IncomeFormType>({
    amount: 0,
    source: '',
    frequency: 'monthly',
    startDate: getCurrentDateISO(),
  });

  // Handle profile updates
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateProfile({
      name: userName,
      currency: userCurrency,
      savingsGoal: savingsGoal
    });
    
    setIsEditing(false);
  };

  // Handle income form submission
  const handleIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingIncomeId) {
      // Update existing income
      editIncome(editingIncomeId, incomeForm);
      setEditingIncomeId(null);
    } else {
      // Create new income
      createIncome(
        incomeForm.amount,
        incomeForm.source,
        incomeForm.frequency,
        incomeForm.startDate,
        incomeForm.endDate
      );
    }
    
    // Reset form and close it
    setIncomeForm({
      amount: 0,
      source: '',
      frequency: 'monthly',
      startDate: getCurrentDateISO(),
    });
    setIsAddingIncome(false);
  };

  // Handle editing an income
  const handleEditIncome = (income: Income) => {
    setIncomeForm({
      amount: income.amount,
      source: income.source,
      frequency: income.frequency,
      startDate: income.startDate,
      endDate: income.endDate
    });
    setEditingIncomeId(income.id);
    setIsAddingIncome(true);
  };

  // Handle deleting an income
  const handleDeleteIncome = (id: string) => {
    if (window.confirm('Are you sure you want to delete this income source?')) {
      removeIncome(id);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Section */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Personal Details</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-primary-600 hover:text-primary-800 text-sm font-medium"
              >
                Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="label">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="currency" className="label">
                  Preferred Currency
                </label>
                <select
                  id="currency"
                  value={userCurrency}
                  onChange={(e) => setUserCurrency(e.target.value)}
                  className="select"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="AUD">AUD (A$)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="savingsGoal" className="label">
                  Monthly Savings Goal
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="savingsGoal"
                    min="0"
                    step="0.01"
                    value={savingsGoal}
                    onChange={(e) => setSavingsGoal(parseFloat(e.target.value) || 0)}
                    className="pl-7 pr-12 input"
                    placeholder="0.00"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">per month</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Profile
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p className="mt-1 text-lg text-gray-900">{profile?.name}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Currency</h3>
                <p className="mt-1 text-lg text-gray-900">{profile?.currency}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Monthly Savings Goal</h3>
                <p className="mt-1 text-lg text-gray-900">
                  {formatCurrency(profile?.savingsGoal || 0)}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Income Sources Section */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Income Sources</h2>
            {!isAddingIncome && (
              <button
                onClick={() => setIsAddingIncome(true)}
                className="btn btn-primary btn-sm"
              >
                Add Income
              </button>
            )}
          </div>

          {isAddingIncome ? (
            <form onSubmit={handleIncomeSubmit} className="space-y-4">
              <div>
                <label htmlFor="source" className="label">
                  Income Source
                </label>
                <input
                  type="text"
                  id="source"
                  value={incomeForm.source}
                  onChange={(e) => setIncomeForm({ ...incomeForm, source: e.target.value })}
                  className="input"
                  placeholder="e.g. Salary, Freelance Work, Investments"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="amount" className="label">
                  Amount
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    min="0.01"
                    step="0.01"
                    value={incomeForm.amount}
                    onChange={(e) => setIncomeForm({ ...incomeForm, amount: parseFloat(e.target.value) || 0 })}
                    className="pl-7 pr-12 input"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="frequency" className="label">
                  Frequency
                </label>
                <select
                  id="frequency"
                  value={incomeForm.frequency}
                  onChange={(e) => setIncomeForm({ ...incomeForm, frequency: e.target.value as any })}
                  className="select"
                >
                  <option value="one-time">One-time</option>
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="startDate" className="label">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={incomeForm.startDate}
                  onChange={(e) => setIncomeForm({ ...incomeForm, startDate: e.target.value })}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="endDate" className="label">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={incomeForm.endDate || ''}
                  onChange={(e) => setIncomeForm({ ...incomeForm, endDate: e.target.value || undefined })}
                  className="input"
                  min={incomeForm.startDate}
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingIncome(false);
                    setEditingIncomeId(null);
                    setIncomeForm({
                      amount: 0,
                      source: '',
                      frequency: 'monthly',
                      startDate: getCurrentDateISO(),
                    });
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingIncomeId ? 'Update Income' : 'Add Income'}
                </button>
              </div>
            </form>
          ) : (
            <div>
              {profile?.incomes.length === 0 ? (
                <div className="text-center py-8">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No income sources</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Add your first income source to get better financial insights.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {profile?.incomes.map((income) => (
                    <div 
                      key={income.id} 
                      className="flex flex-col sm:flex-row sm:justify-between p-4 border rounded-md border-gray-200 bg-gray-50"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">{income.source}</h3>
                        <p className="text-lg font-semibold text-primary-600">
                          {formatCurrency(income.amount)}
                          <span className="text-sm font-normal text-gray-500 ml-1">
                            per {income.frequency === 'one-time' ? 'one-time' : income.frequency}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(income.startDate)}
                          {income.endDate && ` - ${formatDate(income.endDate)}`}
                        </p>
                      </div>
                      <div className="flex space-x-2 mt-2 sm:mt-0 sm:ml-4">
                        <button
                          onClick={() => handleEditIncome(income)}
                          className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteIncome(income.id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 