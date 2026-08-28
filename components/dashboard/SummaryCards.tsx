import React from 'react';
import { Card } from '@/components/ui/Card';
import { SummaryStats } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  TrendingUp,
  Percent,
} from 'lucide-react';

interface SummaryCardsProps {
  stats: SummaryStats;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Balance Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-white to-blue-50/50 border-blue-100">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Total Balance
          </span>
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {formatCurrency(stats.totalBalance)}
          </div>
          <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
            <span className="font-medium text-blue-600">Net Accumulated</span> across all accounts
          </p>
        </div>
      </Card>

      {/* 2. Monthly Income Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-white to-emerald-50/50 border-emerald-100">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Income (This Month)
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
            {formatCurrency(stats.monthlyIncome)}
          </div>
          <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Monthly Cash Inflow</span>
          </p>
        </div>
      </Card>

      {/* 3. Monthly Expense Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-white to-red-50/50 border-red-100">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Expense (This Month)
          </span>
          <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-600 flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl sm:text-3xl font-extrabold text-red-600 tracking-tight">
            {formatCurrency(stats.monthlyExpense)}
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            Total spending for current month
          </p>
        </div>
      </Card>

      {/* 4. Net Savings & Savings Rate Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-white to-indigo-50/50 border-indigo-100">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Net Savings (Month)
          </span>
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
            <PiggyBank className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <div
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              stats.netSavings >= 0 ? 'text-indigo-600' : 'text-red-600'
            }`}
          >
            {formatCurrency(stats.netSavings)}
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-xs text-gray-500">
              Savings Rate:
            </p>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                stats.savingsRate >= 20
                  ? 'bg-emerald-100 text-emerald-800'
                  : stats.savingsRate > 0
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {stats.savingsRate}%
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
