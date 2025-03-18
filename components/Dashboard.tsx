'use client';

import { useState } from 'react';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import Analytics from './Analytics';
import Settings from './Settings';
import { useExpenses } from '../hooks/useExpenses';
import { useSettings } from '../hooks/useSettings';
import { useAnalytics } from '../hooks/useAnalytics';

type TabType = 'expenses' | 'analytics' | 'settings';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('expenses');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { expenses, loading: expensesLoading, addExpense, editExpense, removeExpense } = useExpenses();
  const { settings, loading: settingsLoading } = useSettings();
  const { weeklyAnalytics, monthlyAnalytics, yearlyAnalytics, loading: analyticsLoading } = useAnalytics();
  
  const handleAddExpense = () => {
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Personal Expense Tracker</h1>
        {activeTab === 'expenses' && (
          <button
            onClick={handleAddExpense}
            className="mt-4 md:mt-0 btn btn-primary"
          >
            Add Expense
          </button>
        )}
      </div>
      
      <div className="mb-8">
        <nav className="flex space-x-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-3 py-2 font-medium text-sm border-b-2 ${
              activeTab === 'expenses'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-2 font-medium text-sm border-b-2 ${
              activeTab === 'analytics'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-2 font-medium text-sm border-b-2 ${
              activeTab === 'settings'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Settings
          </button>
        </nav>
      </div>
      
      {/* Expense Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Add New Expense</h2>
            <ExpenseForm 
              onSubmit={(expenseData) => {
                addExpense(
                  expenseData.amount,
                  expenseData.description,
                  expenseData.date,
                  expenseData.category,
                  expenseData.recurring
                );
                handleCloseForm();
              }}
              onCancel={handleCloseForm}
              categories={settings?.categories || []}
            />
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="bg-white shadow rounded-lg">
        {activeTab === 'expenses' && (
          <ExpenseList 
            expenses={expenses}
            onEdit={editExpense}
            onDelete={removeExpense}
            loading={expensesLoading}
            categories={settings?.categories || []}
          />
        )}
        
        {activeTab === 'analytics' && (
          <Analytics 
            weeklyAnalytics={weeklyAnalytics}
            monthlyAnalytics={monthlyAnalytics}
            yearlyAnalytics={yearlyAnalytics}
            loading={analyticsLoading}
            categories={settings?.categories || []}
          />
        )}
        
        {activeTab === 'settings' && (
          <Settings loading={settingsLoading} />
        )}
      </div>
    </div>
  );
} 