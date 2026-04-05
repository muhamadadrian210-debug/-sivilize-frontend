import React, { useState, useEffect } from 'react';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [analytics, setAnalytics] = useState({
    totalProjects: 0,
    totalRABCalculations: 0,
    totalValue: 0,
    avgProjectValue: 0,
    topProvinces: [],
    projectTypes: [],
    monthlyTrend: [],
    userGrowth: []
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // Simulate analytics data (in real app, fetch from backend)
    setAnalytics({
      totalProjects: 47,
      totalRABCalculations: 156,
      totalValue: 28500000000,
      avgProjectValue: 606383000,
      topProvinces: [
        { name: 'Jawa Barat', count: 12, value: 8500000000 },
        { name: 'DKI Jakarta', count: 8, value: 6200000000 },
        { name: 'Jawa Tengah', count: 7, value: 4800000000 },
        { name: 'Jawa Timur', count: 6, value: 3900000000 },
        { name: 'Bali', count: 4, value: 2100000000 }
      ],
      projectTypes: [
        { type: 'Tipe Menengah', count: 28, percentage: 60 },
        { type: 'Tipe Sederhana', count: 15, percentage: 32 },
        { type: 'Tipe Mewah', count: 4, percentage: 8 }
      ],
      monthlyTrend: [
        { month: 'Jan', projects: 3, value: 1800000000 },
        { month: 'Feb', projects: 5, value: 2900000000 },
        { month: 'Mar', projects: 8, value: 4200000000 },
        { month: 'Apr', projects: 12, value: 6800000000 },
        { month: 'May', projects: 10, value: 5900000000 },
        { month: 'Jun', projects: 9, value: 6900000000 }
      ],
      userGrowth: [
        { month: 'Jan', users: 12 },
        { month: 'Feb', users: 18 },
        { month: 'Mar', users: 25 },
        { month: 'Apr', users: 32 },
        { month: 'May', users: 41 },
        { month: 'Jun', users: 47 }
      ]
    });
  }, [timeRange]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Track your RAB calculations and project insights</p>
          </div>
          
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.totalProjects)}</p>
                <p className="text-sm text-green-600 mt-1">+12% from last period</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">RAB Calculations</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.totalRABCalculations)}</p>
                <p className="text-sm text-green-600 mt-1">+8% from last period</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Project Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalValue)}</p>
                <p className="text-sm text-green-600 mt-1">+23% from last period</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Project Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.avgProjectValue)}</p>
                <p className="text-sm text-green-600 mt-1">+5% from last period</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Trend Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h3>
            <div className="space-y-3">
              {analytics.monthlyTrend.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-12 text-sm text-gray-600">{item.month}</div>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-6 relative">
                      <div
                        className="bg-orange-500 h-6 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(item.value / Math.max(...analytics.monthlyTrend.map(t => t.value))) * 100}%` }}
                      >
                        <span className="text-xs text-white font-medium">{item.projects}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-900 font-medium w-24 text-right">
                    {formatCurrency(item.value)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Provinces */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Provinces</h3>
            <div className="space-y-3">
              {analytics.topProvinces.map((province, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-bold text-orange-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{province.name}</p>
                      <p className="text-xs text-gray-600">{province.count} projects</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(province.value)}</p>
                    <p className="text-xs text-gray-600">
                      {((province.value / analytics.totalValue) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Project Types Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Types</h3>
            <div className="space-y-3">
              {analytics.projectTypes.map((type, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded mr-3 ${
                        index === 0 ? 'bg-orange-500' : index === 1 ? 'bg-blue-500' : 'bg-purple-500'
                      }`}
                    ></div>
                    <span className="text-sm font-medium text-gray-900">{type.type}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-3">{type.count} projects</span>
                    <span className="text-sm font-medium text-gray-900">{type.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Growth */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
            <div className="space-y-3">
              {analytics.userGrowth.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-12 text-sm text-gray-600">{item.month}</div>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-4 relative">
                      <div
                        className="bg-green-500 h-4 rounded-full"
                        style={{ width: `${(item.users / Math.max(...analytics.userGrowth.map(u => u.users))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-900 font-medium w-12 text-right">
                    {item.users}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
