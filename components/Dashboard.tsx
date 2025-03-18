'use client';

import { useState, useEffect } from 'react';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import Analytics from './Analytics';
import Settings from './Settings';
import UserProfile from './UserProfile';
import { useExpenses } from '../hooks/useExpenses';
import { useSettings } from '../hooks/useSettings';
import { useAnalytics } from '../hooks/useAnalytics';
import { useProfile } from '../hooks/useProfile';
import { FiPlus, FiUser, FiList, FiPieChart, FiSettings, FiHome, FiMoon, FiSun } from 'react-icons/fi';

type TabType = 'expenses' | 'analytics' | 'profile' | 'settings';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('expenses');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const { expenses, loading: expensesLoading, addExpense, editExpense, removeExpense } = useExpenses();
  const { settings, loading: settingsLoading } = useSettings();
  const { weeklyAnalytics, monthlyAnalytics, yearlyAnalytics, loading: analyticsLoading } = useAnalytics();
  const { profile, loading: profileLoading } = useProfile();
  
  // Set theme on component mount
  useEffect(() => {
    if (settings?.theme === 'dark' || 
        (settings?.theme === 'system' && 
         window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, [settings?.theme]);
  
  const handleAddExpense = () => {
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
  };
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FiHome className="h-6 w-6 text-primary-500" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Personal Expense Tracker</h1>
            </div>
            
            <div className="flex items-center space-x-6">
              {profile && (
                <div className="hidden md:flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                    <span className="text-primary-700 dark:text-primary-300 font-medium">
                      {profile.name.slice(0, 1).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {profile.name}
                  </span>
                </div>
              )}
              
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-3 py-2 font-medium text-sm border-b-2 flex items-center ${
                activeTab === 'expenses'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <FiList className="mr-2 h-4 w-4" />
              Expenses
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-2 font-medium text-sm border-b-2 flex items-center ${
                activeTab === 'analytics'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <FiPieChart className="mr-2 h-4 w-4" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-2 font-medium text-sm border-b-2 flex items-center ${
                activeTab === 'profile'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <FiUser className="mr-2 h-4 w-4" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-2 font-medium text-sm border-b-2 flex items-center ${
                activeTab === 'settings'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <FiSettings className="mr-2 h-4 w-4" />
              Settings
            </button>
          </nav>
        </div>
        
        {/* Action Button */}
        {activeTab === 'expenses' && (
          <div className="fixed right-6 bottom-6 z-10">
            <button
              onClick={handleAddExpense}
              className="h-14 w-14 rounded-full bg-primary-600 hover:bg-primary-700 text-white shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 hover:scale-110"
              aria-label="Add Expense"
            >
              <FiPlus className="h-6 w-6" />
            </button>
          </div>
        )}
        
        {/* Expense Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add New Expense</h2>
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
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg transition-colors duration-300">
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
          
          {activeTab === 'profile' && (
            <UserProfile />
          )}
          
          {activeTab === 'settings' && (
            <Settings loading={settingsLoading} />
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-inner transition-colors duration-300 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Personal Expense Tracker | Made by Mrudul Ketan Panchal
          </p>
        </div>
      </footer>
    </div>
  );
} 