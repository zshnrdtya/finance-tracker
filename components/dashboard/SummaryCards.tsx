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
} from 'lucide-react';

interface SummaryCardsProps {
  stats: SummaryStats;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {/* 1. Total Saldo Card */}
      <Card padding="none" className="relative overflow-hidden bg-gradient-to-br from-white to-blue-50/50 border-blue-100 p-3.5 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500">
            Total Saldo
          </span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="mt-2.5 sm:mt-4">
          <div className="text-base sm:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight truncate" title={formatCurrency(stats.totalBalance)}>
            {formatCurrency(stats.totalBalance)}
          </div>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1 flex items-center gap-1 truncate">
            <span className="font-medium text-blue-600">Akumulasi Bersih</span>
          </p>
        </div>
      </Card>

      {/* 2. Pemasukan Bulan Ini Card */}
      <Card padding="none" className="relative overflow-hidden bg-gradient-to-br from-white to-emerald-50/50 border-emerald-100 p-3.5 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500">
            Pemasukan
          </span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="mt-2.5 sm:mt-4">
          <div className="text-base sm:text-2xl lg:text-3xl font-extrabold text-emerald-600 tracking-tight truncate" title={formatCurrency(stats.monthlyIncome)}>
            {formatCurrency(stats.monthlyIncome)}
          </div>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1 flex items-center gap-1 truncate">
            <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
            <span>Kas Masuk Bulan Ini</span>
          </p>
        </div>
      </Card>

      {/* 3. Pengeluaran Bulan Ini Card */}
      <Card padding="none" className="relative overflow-hidden bg-gradient-to-br from-white to-red-50/50 border-red-100 p-3.5 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500">
            Pengeluaran
          </span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-red-600/10 text-red-600 flex items-center justify-center shrink-0">
            <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="mt-2.5 sm:mt-4">
          <div className="text-base sm:text-2xl lg:text-3xl font-extrabold text-red-600 tracking-tight truncate" title={formatCurrency(stats.monthlyExpense)}>
            {formatCurrency(stats.monthlyExpense)}
          </div>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1 truncate">
            Belanja & tagihan bulan ini
          </p>
        </div>
      </Card>

      {/* 4. Tabungan Bersih & Rasio Tabungan Card */}
      <Card padding="none" className="relative overflow-hidden bg-gradient-to-br from-white to-indigo-50/50 border-indigo-100 p-3.5 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500">
            Tabungan Bersih
          </span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center shrink-0">
            <PiggyBank className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="mt-2.5 sm:mt-4">
          <div
            className={`text-base sm:text-2xl lg:text-3xl font-extrabold tracking-tight truncate ${
              stats.netSavings >= 0 ? 'text-indigo-600' : 'text-red-600'
            }`}
            title={formatCurrency(stats.netSavings)}
          >
            {formatCurrency(stats.netSavings)}
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[10px] sm:text-xs text-gray-500 truncate">
              Rasio:
            </p>
            <span
              className={`text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full ${
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
