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
    if (!editingTransaction) return { error: 'No transaction selected for edit' };
    return await updateTransaction(editingTransaction.id, data);
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Metrics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Transaction History
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Showing all recorded entries. Filter by category, type, or search keywords.
          </p>
        </div>

        <Button
          onClick={openAddTransaction}
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-sm shadow-blue-500/20 self-start sm:self-auto"
        >
          Add Transaction
        </Button>
      </div>

      {/* Quick Summary Pill Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Total Inflow</p>
              <p className="text-base font-bold text-emerald-600">
                {formatCurrency(totalIncome)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Total Outflow</p>
              <p className="text-base font-bold text-red-600">
                {formatCurrency(totalExpense)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ReceiptText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Total Records</p>
              <p className="text-base font-bold text-gray-900">
                {transactions.length} transactions
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
