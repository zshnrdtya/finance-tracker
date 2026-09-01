'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { ExpensePieChart } from '@/components/analytics/ExpensePieChart';
import { IncomeExpenseBarChart } from '@/components/analytics/IncomeExpenseBarChart';
import { CategoryBreakdownTable } from '@/components/analytics/CategoryBreakdownTable';
import { calculateMonthlyComparison } from '@/lib/utils';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function AnalyticsPage() {
  const { transactions, expenseBreakdown, incomeBreakdown } = useFinance();
  const [breakdownType, setBreakdownType] = useState<'expense' | 'income'>('expense');
  const [trendMonthCount, setTrendMonthCount] = useState<number>(6);

  const dynamicMonthlyData = calculateMonthlyComparison(transactions, trendMonthCount);
  const currentBreakdown = breakdownType === 'expense' ? expenseBreakdown : incomeBreakdown;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Laporan & Analitik Keuangan
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Rincian visual kebiasaan pengeluaran, sumber pemasukan, dan tren bulanan.
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
            Distribusi Kategori
          </h3>

          <div className="grid grid-cols-2 sm:flex items-center gap-1.5 sm:gap-2 bg-gray-100 p-1 rounded-xl w-full sm:w-fit">
            <button
              type="button"
              onClick={() => setBreakdownType('expense')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                breakdownType === 'expense'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Pengeluaran</span>
            </button>
            <button
              type="button"
              onClick={() => setBreakdownType('income')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                breakdownType === 'income'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Pemasukan</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Pie Chart */}
          <div className="lg:col-span-6">
            <ExpensePieChart
              data={currentBreakdown}
              type={breakdownType}
              title={`${breakdownType === 'expense' ? 'Pengeluaran' : 'Pemasukan'} Berdasarkan Kategori`}
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
