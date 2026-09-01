'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { Transaction, Category, TransactionType } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Search,
  Trash2,
  Edit2,
  Calendar,
  AlertTriangle,
  ReceiptText,
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onOpenAddModal: () => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => Promise<void>;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Type match
      if (typeFilter !== 'all' && t.category?.type !== typeFilter) {
        return false;
      }

      // Category match
      if (categoryFilter !== 'all' && t.category_id !== categoryFilter) {
        return false;
      }

      // Search match
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const catName = t.category?.name.toLowerCase() || '';
        const desc = t.description?.toLowerCase() || '';
        const amountStr = t.amount.toString();
        if (!catName.includes(query) && !desc.includes(query) && !amountStr.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, typeFilter, categoryFilter, searchTerm]);

  // Categories available for category filter dropdown
  const filterCategories = useMemo(() => {
    if (typeFilter === 'all') return categories;
    return categories.filter((c) => c.type === typeFilter);
  }, [categories, typeFilter]);

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await onDeleteTransaction(deleteTargetId);
      setDeleteTargetId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls & Filter Bar */}
      <Card padding="sm" className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="sm:col-span-5">
            <Input
              type="text"
              placeholder="Cari deskripsi, kategori, nominal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-gray-400" />}
              className="h-10"
            />
          </div>

          {/* Type filter */}
          <div className="sm:col-span-3">
            <Select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as 'all' | TransactionType);
                setCategoryFilter('all');
              }}
              className="h-10"
            >
              <option value="all">Semua Tipe (Pemasukan & Pengeluaran)</option>
              <option value="income">Pemasukan Saja</option>
              <option value="expense">Pengeluaran Saja</option>
            </Select>
          </div>

          {/* Category filter */}
          <div className="sm:col-span-4">
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10"
            >
              <option value="all">Semua Kategori</option>
              {filterCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.type === 'income' ? 'Pemasukan' : 'Pengeluaran'})
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Filter Summary Tags */}
        {(searchTerm || typeFilter !== 'all' || categoryFilter !== 'all') && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
            <span>Menampilkan {filteredTransactions.length} dari {transactions.length} catatan</span>
            <button
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setCategoryFilter('all');
              }}
              className="text-blue-600 font-semibold hover:underline cursor-pointer ml-auto"
            >
              Reset Filter
            </button>
          </div>
        )}
      </Card>

      {/* Transaction List Card */}
      <Card padding="none" className="overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={ReceiptText}
              title={
                transactions.length === 0
                  ? 'Belum ada transaksi tercatat'
                  : 'Tidak ada transaksi yang sesuai pencarian'
              }
              description={
                transactions.length === 0
                  ? 'Klik tombol di bawah untuk menambahkan catatan pemasukan atau pengeluaran pertama Anda.'
                  : 'Coba sesuaikan kata kunci pencarian atau pengaturan filter Anda.'
              }
              actionLabel={transactions.length === 0 ? 'Tambah Transaksi' : 'Bersihkan Filter'}
              onAction={
                transactions.length === 0
                  ? onOpenAddModal
                  : () => {
                      setSearchTerm('');
                      setTypeFilter('all');
                      setCategoryFilter('all');
                    }
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTransactions.map((t) => {
              const isIncome = t.category?.type === 'income';
              return (
                <div
                  key={t.id}
                  className="p-4 sm:px-6 flex items-center justify-between hover:bg-gray-50/80 transition-colors group"
                >
                  {/* Left: Category Icon & Details */}
                  <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
                    <CategoryIcon
                      iconName={t.category?.icon}
                      type={isIncome ? 'income' : 'expense'}
                      color={t.category?.color}
                      size="md"
                      className="w-9 h-9 sm:w-10 sm:h-10 shrink-0"
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate max-w-[130px] sm:max-w-xs">
                          {t.category?.name || 'Tanpa Kategori'}
                        </span>
                        <Badge variant={isIncome ? 'success' : 'danger'} size="sm" className="px-1.5 py-0 text-[10px]">
                          {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-[11px] sm:text-xs text-gray-500">
                        <span className="flex items-center gap-1 text-gray-400 shrink-0">
                          <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          {formatDate(t.date, 'short')}
                        </span>
                        {t.description && (
                          <span className="truncate max-w-[120px] sm:max-w-md text-gray-600 font-medium">
                            &bull; {t.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 ml-2">
                    <div className="text-right">
                      <span
                        className={`text-xs sm:text-base font-bold tracking-tight block whitespace-nowrap ${
                          isIncome ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {isIncome ? '+' : '-'} {formatCurrency(Number(t.amount))}
                      </span>
                    </div>

                    {/* Action buttons (Edit / Delete) */}
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <button
                        onClick={() => onEditTransaction(t)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit transaksi"
                      >
                        <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(t.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus transaksi"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        title="Hapus Transaksi"
        description="Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan."
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-red-50 text-red-800 rounded-xl text-xs">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>Catatan transaksi ini akan dihapus permanen dan saldo Anda akan dihitung ulang secara otomatis.</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTargetId(null)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={confirmDelete}
              isLoading={isDeleting}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
