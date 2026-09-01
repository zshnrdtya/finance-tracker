'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardTitle } from '@/components/ui/Card';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Transaction } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowRight, ReceiptText, Edit2 } from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onOpenAddModal: () => void;
  onEditTransaction?: (transaction: Transaction) => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  onOpenAddModal,
  onEditTransaction,
}) => {
  const recentList = transactions.slice(0, 5);

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <CardTitle className="text-base sm:text-lg">Transaksi Terbaru</CardTitle>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">5 aktivitas keuangan terakhir yang tercatat</p>
        </div>
        <Link
          href="/dashboard/transactions"
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all shrink-0"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {recentList.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={ReceiptText}
            title="Belum ada transaksi"
            description="Mulai catat pemasukan dan pengeluaran Anda untuk melihat riwayatnya di sini."
            actionLabel="Catat Transaksi Pertama"
            onAction={onOpenAddModal}
          />
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {recentList.map((t) => {
            const isIncome = t.category?.type === 'income';
            return (
              <div
                key={t.id}
                className="p-3.5 sm:px-6 flex items-center justify-between hover:bg-gray-50/80 transition-colors group"
              >
                <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                  <CategoryIcon
                    iconName={t.category?.icon}
                    type={isIncome ? 'income' : 'expense'}
                    color={t.category?.color}
                    size="md"
                    className="w-9 h-9 sm:w-10 sm:h-10"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate max-w-[130px] sm:max-w-[180px]">
                        {t.category?.name || 'Tanpa Kategori'}
                      </p>
                      {t.description && (
                        <span className="hidden sm:inline-block text-xs text-gray-500 truncate max-w-[180px]">
                          &bull; {t.description}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[11px] sm:text-xs text-gray-400">
                      <span>{formatDate(t.date, 'short')}</span>
                      {t.description && (
                        <span className="sm:hidden text-gray-500 truncate max-w-[120px]">
                          ({t.description})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2">
                  <div className="text-right">
                    <span
                      className={`text-xs sm:text-base font-bold tracking-tight block whitespace-nowrap ${
                        isIncome ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {formatCurrency(Number(t.amount))}
                    </span>
                    <div className="text-[10px] sm:text-[11px] text-gray-400">
                      <Badge variant={isIncome ? 'success' : 'danger'} size="sm" className="px-1.5 py-0 text-[10px]">
                        {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                      </Badge>
                    </div>
                  </div>

                  {onEditTransaction && (
                    <button
                      type="button"
                      onClick={() => onEditTransaction(t)}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit transaksi"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
