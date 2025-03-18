'use client';

import { useState } from 'react';
import { ExpenseAnalytics, ExpenseCategory } from '../utils/types';
import { formatCurrency, getRatingColor } from '../utils/helpers';
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
  const [activeTimeframe, setActiveTimeframe] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  
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
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Timeframe Selector */}
      <div className="mb-8">
        <div className="flex border border-gray-200 rounded-md overflow-hidden">
          <button
            onClick={() => setActiveTimeframe('weekly')}
            className={`flex-1 py-2 px-4 text-sm font-medium ${
              activeTimeframe === 'weekly'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setActiveTimeframe('monthly')}
            className={`flex-1 py-2 px-4 text-sm font-medium ${
              activeTimeframe === 'monthly'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setActiveTimeframe('yearly')}
            className={`flex-1 py-2 px-4 text-sm font-medium ${
              activeTimeframe === 'yearly'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Total Spent</h3>
              <p className="text-3xl font-bold text-primary-600">
                {formatCurrency(analytics.totalSpent)}
              </p>
            </div>

            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Spending Rating</h3>
              <div className="flex items-center">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold mr-3"
                  style={{ backgroundColor: getRatingColor(analytics.rating) }}
                >
                  {analytics.rating}
                </div>
                <p className="text-gray-700">{analytics.message}</p>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Categories</h3>
              <p className="text-gray-700">
                <span className="font-medium">{Object.keys(analytics.categoriesBreakdown).length}</span> categories with expenses
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Spending Over Time</h3>
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
                            callback: (value) => '$' + value,
                          },
                        },
                      },
                    }}
                  />
                )}
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Category Breakdown</h3>
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

          {/* Category Details */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Category Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(analytics.categoriesBreakdown)
                    .sort(([, a], [, b]) => b - a)
                    .map(([categoryId, amount]) => (
                      <tr key={categoryId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: getCategoryColor(categoryId) }}
                            ></div>
                            <span className="text-sm font-medium text-gray-900">
                              {getCategoryName(categoryId)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
          <p className="mt-1 text-sm text-gray-500">
            Add some expenses to view analytics.
          </p>
        </div>
      )}
    </div>
  );
} 