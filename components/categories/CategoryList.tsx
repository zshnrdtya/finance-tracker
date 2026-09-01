'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { EmptyState } from '@/components/ui/EmptyState';
import { Category, TransactionType } from '@/lib/types';
import {
  FolderKanban,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

interface CategoryListProps {
  categories: Category[];
  onOpenAddModal: () => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => Promise<{ error?: string | null }>;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onOpenAddModal,
  onEditCategory,
  onDeleteCategory,
}) => {
  const [activeTab, setActiveTab] = useState<TransactionType>('expense');
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filteredCategories = categories.filter((c) => c.type === activeTab);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);

    const res = await onDeleteCategory(deleteTarget.id);
    setIsDeleting(false);

    if (res.error) {
      setDeleteError(res.error);
    } else {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Type Filter Buttons */}
        <div className="grid grid-cols-2 sm:flex items-center gap-1.5 sm:gap-2 bg-gray-100 p-1 rounded-xl w-full sm:w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('expense')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'expense'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-red-500 shrink-0" />
            <span>Pengeluaran ({categories.filter((c) => c.type === 'expense').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('income')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'income'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Pemasukan ({categories.filter((c) => c.type === 'income').length})</span>
          </button>
        </div>

        <Button
          onClick={onOpenAddModal}
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-sm shadow-blue-500/20 font-semibold w-full sm:w-auto justify-center"
        >
          Tambah Kategori Baru
        </Button>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <Card padding="none">
          <div className="p-6 sm:p-8">
            <EmptyState
              icon={FolderKanban}
              title={`Belum ada kategori ${activeTab === 'expense' ? 'pengeluaran' : 'pemasukan'}`}
              description={`Buat kategori ${activeTab === 'expense' ? 'pengeluaran' : 'pemasukan'} khusus Anda untuk mengelompokkan transaksi.`}
              actionLabel="Tambah Kategori"
              onAction={onOpenAddModal}
            />
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredCategories.map((cat) => (
            <Card
              key={cat.id}
              padding="sm"
              hoverEffect
              className="flex items-center justify-between gap-3 group relative border-gray-200 p-3.5 sm:p-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <CategoryIcon
                  iconName={cat.icon}
                  type={cat.type}
                  color={cat.color}
                  size="md"
                  className="w-9 h-9 sm:w-10 sm:h-10 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate" title={cat.name}>
                    {cat.name}
                  </h4>
                  <p className="text-[11px] text-gray-400 capitalize">
                    Kategori {cat.type === 'income' ? 'pemasukan' : 'pengeluaran'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onEditCategory(cat)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  title="Edit kategori"
                >
                  <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError(null);
                    setDeleteTarget(cat);
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Hapus kategori"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Category Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        title={`Hapus Kategori: "${deleteTarget?.name}"`}
        description="Apakah Anda yakin ingin menghapus kategori ini?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          {deleteError ? (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              <div className="font-semibold mb-1">Tidak Dapat Menghapus Kategori</div>
              <p>{deleteError}</p>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-3 bg-amber-50 text-amber-900 rounded-xl text-xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Jika ada transaksi yang terhubung dengan kategori ini, Anda harus mengubah atau menghapus transaksi tersebut terlebih dahulu sebelum menghapus kategori ini.
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDeleteTarget(null);
                setDeleteError(null);
              }}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteConfirm}
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
