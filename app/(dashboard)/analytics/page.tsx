'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { ExpensePieChart } from '@/components/analytics/ExpensePieChart';
import { IncomeExpenseBarChart } from '@/components/analytics/IncomeExpenseBarChart';
import { CategoryBreakdownTable } from '@/components/analytics/CategoryBreakdownTable';
import { calculateMonthlyComparison } from '@/lib/utils';
import { PieChart, BarChart3, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function AnalyticsPage() {
  const { transactions, categories, expenseBreakdown, incomeBreakdown } = useFinance();
  const [breakdownType, setBreakdownType] = useState<'expense' | 'income'>('expense');
  const [trendMonthCount, setTrendMonthCount] = useState<number>(6);

  // Recalculate dynamic monthly comparison according to selected range
  const dynamicMonthlyData = calculateMonthlyComparison(transactions, trendMonthCount);

  const currentBreakdown = breakdownType === 'expense' ? expenseBreakdown : incomeBreakdown;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Financial Reports & Analytics
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Detailed visual breakdown of spending habits, income sources, and monthly trends.
        </p>
      </div>

      {/* 1. Comparative Multi-Month Bar Chart */}
      <IncomeExpenseBarChart
        data={dynamicMonthlyData}
        monthCount={trendMonthCount}
        onMonthCountChange={(count) => setTrendMonthCount(count)}
      />

      {/* 2. Category Breakdown Section with Toggle */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-gray-900">
            Category Distribution
          </h3>

          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setBreakdownType('expense')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                breakdownType === 'expense'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              Expense Distribution
            </button>
            <button
              type="button"
              onClick={() => setBreakdownType('income')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                breakdownType === 'income'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Income Distribution
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Pie Chart */}
          <div className="lg:col-span-6">
            <ExpensePieChart
              data={currentBreakdown}
              type={breakdownType}
              title={`${breakdownType === 'expense' ? 'Expenses' : 'Income'} by Category`}
            />
          </div>

          {/* Breakdown Table with Progress Bars */}
          <div className="lg:col-span-6">
            <CategoryBreakdownTable
              data={currentBreakdown}
              type={breakdownType}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
