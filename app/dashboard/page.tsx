'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { MonthlyOverviewChart } from '@/components/dashboard/MonthlyOverviewChart';
import { ExpensePieChart } from '@/components/analytics/ExpensePieChart';
import { TransactionFormModal } from '@/components/transactions/TransactionFormModal';
import { Button } from '@/components/ui/Button';
import { Transaction } from '@/lib/types';
import { PlusCircle, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const {
    user,
    stats,
    transactions,
    categories,
    expenseBreakdown,
    monthlyChartData,
    openAddTransaction,
    updateTransaction,
    fetchData,
  } = useFinance();

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Pengguna';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-white shadow-lg shadow-blue-500/15 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-[11px] sm:text-xs font-medium text-blue-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Selamat datang kembali, {userName}!</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Ringkasan Keuangan Anda
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm max-w-xl leading-relaxed">
            Pantau pemasukan dan pengeluaran Anda untuk mencapai tujuan finansial. Rasio tabungan Anda saat ini adalah{' '}
            <strong className="text-white font-bold">{stats.savingsRate}%</strong> bulan ini.
          </p>
        </div>

        <div className="shrink-0 w-full sm:w-auto">
          <Button
            onClick={openAddTransaction}
            variant="secondary"
            size="lg"
            className="bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-md h-11 w-full sm:w-auto justify-center"
            leftIcon={<PlusCircle className="w-5 h-5 text-blue-600" />}
          >
            Catat Transaksi
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
              title="Distribusi Pengeluaran Bulan Ini"
            />
          )}
        </div>

        {/* Right / Bottom: Recent Transactions List */}
        <div className="lg:col-span-5">
          <RecentTransactions
            transactions={transactions}
            onOpenAddModal={openAddTransaction}
            onEditTransaction={(t) => setEditingTransaction(t)}
          />
        </div>
      </div>

      {/* Edit Transaction Modal from Dashboard */}
      {user && editingTransaction && (
        <TransactionFormModal
          isOpen={Boolean(editingTransaction)}
          onClose={() => setEditingTransaction(null)}
          onSuccess={fetchData}
          categories={categories}
          transactionToEdit={editingTransaction}
          userId={user.id}
          onSave={async (data) => {
            return await updateTransaction(editingTransaction.id, data);
          }}
        />
      )}
    </div>
  );
}
