'use client';

import React from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { MonthlyOverviewChart } from '@/components/dashboard/MonthlyOverviewChart';
import { ExpensePieChart } from '@/components/analytics/ExpensePieChart';
import { Button } from '@/components/ui/Button';
import { PlusCircle, TrendingUp, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const {
    user,
    stats,
    transactions,
    expenseBreakdown,
    monthlyChartData,
    openAddTransaction,
  } = useFinance();

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-blue-500/15 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-medium text-blue-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome back, {userName}!</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Here&apos;s your financial snapshot
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm max-w-xl leading-relaxed">
            Keep track of your income and expenses to reach your financial goals. Your current savings rate is{' '}
            <strong className="text-white">{stats.savingsRate}%</strong> this month.
          </p>
        </div>

        <div className="shrink-0">
          <Button
            onClick={openAddTransaction}
            variant="secondary"
            size="lg"
            className="bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-md h-11"
            leftIcon={<PlusCircle className="w-5 h-5 text-blue-600" />}
          >
            Record Transaction
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards stats={stats} />

      {/* Main Charts & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Top: Monthly Cash Flow Bar Chart */}
        <div className="lg:col-span-7 space-y-6">
          <MonthlyOverviewChart
            data={monthlyChartData}
            onOpenAddModal={openAddTransaction}
          />

          {/* Quick Expense Breakdown Preview */}
          {expenseBreakdown.length > 0 && (
            <ExpensePieChart
              data={expenseBreakdown}
              title="This Month's Expense Distribution"
            />
          )}
        </div>

        {/* Right / Bottom: Recent Transactions List */}
        <div className="lg:col-span-5">
          <RecentTransactions
            transactions={transactions}
            onOpenAddModal={openAddTransaction}
          />
        </div>
      </div>
    </div>
  );
}
