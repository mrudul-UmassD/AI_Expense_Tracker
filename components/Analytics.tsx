'use client';

import { useState } from 'react';
import { ExpenseAnalytics, ExpenseCategory } from '../utils/types';
import { formatCurrency, getRatingColor } from '../utils/helpers';
import { useSettings } from '../hooks/useSettings';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

type AnalyticsProps = {
  weeklyAnalytics: ExpenseAnalytics | null;
  monthlyAnalytics: ExpenseAnalytics | null;
  yearlyAnalytics: ExpenseAnalytics | null;
  categories: ExpenseCategory[];
  loading: boolean;
};

export default function Analytics({
  weeklyAnalytics,
  monthlyAnalytics,
  yearlyAnalytics,
  categories,
  loading,
}: AnalyticsProps) {
  const { settings } = useSettings();
  const currency = settings?.profile?.currency || 'USD';
  const [activeTimeframe, setActiveTimeframe] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  
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

  const getCurrentAnalytics = () => {
    switch (activeTimeframe) {
      case 'weekly':
        return weeklyAnalytics;
      case 'monthly':
        return monthlyAnalytics;
      case 'yearly':
        return yearlyAnalytics;
      default:
        return monthlyAnalytics;
    }
  };

  const analytics = getCurrentAnalytics();

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.color : '#808080';
  };

  // Prepare chart data
  const prepareTimeSeriesData = () => {
    if (!analytics) return null;

    return {
      labels: analytics.timeSeriesData.labels,
      datasets: [
        {
          label: `${activeTimeframe.charAt(0).toUpperCase() + activeTimeframe.slice(1)} Spending`,
          data: analytics.timeSeriesData.values,
          backgroundColor: 'rgba(14, 165, 233, 0.5)',
          borderColor: 'rgb(14, 165, 233)',
          borderWidth: 2,
        },
      ],
    };
  };

  const prepareCategoryData = () => {
    if (!analytics) return null;

    const categoryIds = Object.keys(analytics.categoriesBreakdown);
    
    return {
      labels: categoryIds.map(getCategoryName),
      datasets: [
        {
          data: categoryIds.map((id) => analytics.categoriesBreakdown[id]),
          backgroundColor: categoryIds.map(getCategoryColor),
          borderWidth: 1,
        },
      ],
    };
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Timeframe Selector */}
      <div className="mb-8">
        <div className="flex border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
          <button
            onClick={() => setActiveTimeframe('weekly')}
            className={`flex-1 py-2 px-4 text-sm font-medium ${
              activeTimeframe === 'weekly'
                ? 'bg-primary-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setActiveTimeframe('monthly')}
            className={`flex-1 py-2 px-4 text-sm font-medium ${
              activeTimeframe === 'monthly'
                ? 'bg-primary-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setActiveTimeframe('yearly')}
            className={`flex-1 py-2 px-4 text-sm font-medium ${
              activeTimeframe === 'yearly'
                ? 'bg-primary-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {analytics ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Total Spent</h3>
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                {formatCurrency(analytics.totalSpent, currency)}
              </p>
              {analytics.totalIncome > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Income: {formatCurrency(analytics.totalIncome, currency)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Savings Rate: {analytics.savingsRate.toFixed(1)}%
                  </p>
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Spending Rating</h3>
              <div className="flex items-center">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold mr-3"
                  style={{ backgroundColor: getRatingColor(analytics.rating) }}
                >
                  {analytics.rating}
                </div>
                <p className="text-gray-700 dark:text-gray-300">{analytics.message}</p>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Categories</h3>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">{Object.keys(analytics.categoriesBreakdown).length}</span> categories with expenses
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Spending Over Time</h3>
              <div className="h-64">
                {prepareTimeSeriesData() && (
                  <Line 
                    data={prepareTimeSeriesData() as any}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: (value) => getCurrencySymbol(currency) + value,
                          },
                        },
                      },
                    }}
                  />
                )}
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Category Breakdown</h3>
              <div className="h-64">
                {prepareCategoryData() && (
                  <Doughnut 
                    data={prepareCategoryData() as any}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Suggestions */}
          {analytics.suggestions && analytics.suggestions.length > 0 && (
            <div className="card mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Spending Suggestions</h3>
              <div className="space-y-4">
                {analytics.suggestions.map(suggestion => (
                  <div 
                    key={suggestion.id} 
                    className={`p-4 rounded-lg border-l-4 ${
                      suggestion.priority === 'high' 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/10' 
                        : suggestion.priority === 'medium' 
                          ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' 
                          : 'border-green-500 bg-green-50 dark:bg-green-900/10'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {suggestion.type === 'saving' ? 'Saving Opportunity' : 
                           suggestion.type === 'reduction' ? 'Expense Reduction' : 
                           'Budget Allocation'}
                        </h4>
                        <p className="mt-1 text-gray-700 dark:text-gray-300">{suggestion.description}</p>
                      </div>
                      {suggestion.potentialSavings && (
                        <div className="text-right">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Potential Savings</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(suggestion.potentialSavings, currency)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Details */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Category Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                  {Object.entries(analytics.categoriesBreakdown)
                    .sort(([, a], [, b]) => b - a)
                    .map(([categoryId, amount]) => (
                      <tr key={categoryId} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                            style={{
                              backgroundColor: `${getCategoryColor(categoryId)}20`,
                              color: getCategoryColor(categoryId),
                            }}
                          >
                            {getCategoryName(categoryId)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {formatCurrency(amount, currency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {((amount / analytics.totalSpent) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-700 dark:text-gray-300">No analytics data available for the selected timeframe.</p>
        </div>
      )}
    </div>
  );
} 