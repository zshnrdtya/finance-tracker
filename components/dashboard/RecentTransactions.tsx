'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Transaction } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowRight, ReceiptText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onOpenAddModal: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  onOpenAddModal,
}) => {
  const recentList = transactions.slice(0, 5);

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <CardTitle>Recent Transactions</CardTitle>
          <p className="text-xs text-gray-500 mt-0.5">Your last 5 recorded financial activities</p>
        </div>
        <Link
          href="/dashboard/transactions"
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {recentList.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={ReceiptText}
            title="No transactions yet"
            description="Start logging your income and expenses to see them appear here."
            actionLabel="Add First Transaction"
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
                className="p-4 sm:px-6 flex items-center justify-between hover:bg-gray-50/80 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <CategoryIcon
                    iconName={t.category?.icon}
                    type={isIncome ? 'income' : 'expense'}
                    color={t.category?.color}
                    size="md"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {t.category?.name || 'Uncategorized'}
                      </p>
                      {t.description && (
                        <span className="hidden sm:inline-block text-xs text-gray-500 truncate max-w-[200px]">
                          &bull; {t.description}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                      <span>{formatDate(t.date, 'short')}</span>
                      {t.description && (
                        <span className="sm:hidden text-gray-500 truncate max-w-[140px]">
                          ({t.description})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <span
                    className={`text-sm sm:text-base font-bold tracking-tight ${
                      isIncome ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {isIncome ? '+' : '-'} {formatCurrency(Number(t.amount))}
                  </span>
                  <div className="text-[11px] text-gray-400">
                    <Badge variant={isIncome ? 'success' : 'danger'} size="sm">
                      {isIncome ? 'Income' : 'Expense'}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
