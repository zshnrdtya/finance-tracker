'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionFormModal } from '@/components/transactions/TransactionFormModal';
import { Button } from '@/components/ui/Button';
import { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Plus, ArrowUpRight, ArrowDownLeft, ReceiptText } from 'lucide-react';

export default function TransactionsPage() {
  const {
    user,
    transactions,
    categories,
    openAddTransaction,
    updateTransaction,
    deleteTransaction,
    fetchData,
  } = useFinance();

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const totalIncome = transactions
    .filter((t) => t.category?.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.category?.type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleSaveEdit = async (data: {
    type: any;
    amount: number;
    category_id: string;
    description: string;
    date: string;
  }) => {
    if (!editingTransaction) return { error: 'Tidak ada transaksi yang dipilih untuk diedit' };
    return await updateTransaction(editingTransaction.id, data);
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Metrics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Riwayat Transaksi
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Menampilkan seluruh catatan transaksi. Filter berdasarkan kategori, tipe, atau kata kunci pencarian.
          </p>
        </div>

        <Button
          onClick={openAddTransaction}
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-sm shadow-blue-500/20 w-full sm:w-auto justify-center"
        >
          Tambah Transaksi
        </Button>
      </div>

      {/* Quick Summary Pill Row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 flex items-center justify-between min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="hidden sm:flex w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 items-center justify-center shrink-0">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase truncate">Pemasukan</p>
              <p className="text-xs sm:text-base font-bold text-emerald-600 truncate" title={formatCurrency(totalIncome)}>
                {formatCurrency(totalIncome)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 flex items-center justify-between min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="hidden sm:flex w-9 h-9 rounded-xl bg-red-50 text-red-600 items-center justify-center shrink-0">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase truncate">Pengeluaran</p>
              <p className="text-xs sm:text-base font-bold text-red-600 truncate" title={formatCurrency(totalExpense)}>
                {formatCurrency(totalExpense)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 flex items-center justify-between min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="hidden sm:flex w-9 h-9 rounded-xl bg-blue-50 text-blue-600 items-center justify-center shrink-0">
              <ReceiptText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase truncate">Total Data</p>
              <p className="text-xs sm:text-base font-bold text-gray-900 truncate">
                {transactions.length} entri
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Transactions Table / Card List */}
      <TransactionList
        transactions={transactions}
        categories={categories}
        onOpenAddModal={openAddTransaction}
        onEditTransaction={handleEdit}
        onDeleteTransaction={async (id) => {
          await deleteTransaction(id);
        }}
      />

      {/* Edit Transaction Modal */}
      {user && editingTransaction && (
        <TransactionFormModal
          isOpen={Boolean(editingTransaction)}
          onClose={() => setEditingTransaction(null)}
          onSuccess={fetchData}
          categories={categories}
          transactionToEdit={editingTransaction}
          userId={user.id}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
