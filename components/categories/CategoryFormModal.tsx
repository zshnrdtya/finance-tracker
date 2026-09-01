'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertNotification } from '@/components/ui/Toast';
import { Category, TransactionType } from '@/lib/types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/constants';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { ArrowUpRight, ArrowDownLeft, Check } from 'lucide-react';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
  onSave: (categoryData: {
    name: string;
    type: TransactionType;
    color: string;
    icon: string;
  }) => Promise<{ error?: string | null }>;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  categoryToEdit,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [color, setColor] = useState(CATEGORY_COLORS[0]);
  const [icon, setIcon] = useState(CATEGORY_ICONS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setType(categoryToEdit.type);
      setColor(categoryToEdit.color || CATEGORY_COLORS[0]);
      setIcon(categoryToEdit.icon || CATEGORY_ICONS[0]);
    } else {
      setName('');
      setType('expense');
      setColor(CATEGORY_COLORS[0]);
      setIcon(CATEGORY_ICONS[0]);
    }
    setErrorMessage(null);
  }, [categoryToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Nama kategori wajib diisi.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await onSave({
        name: name.trim(),
        type,
        color,
        icon,
      });

      if (res.error) {
        setErrorMessage(res.error);
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal menyimpan kategori');
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={categoryToEdit ? 'Edit Kategori' : 'Buat Kategori Kustom'}
      description={
        categoryToEdit
          ? 'Perbarui nama, warna, dan ikon untuk kategori ini'
          : 'Buat kategori baru untuk mengelompokkan pengeluaran atau pemasukan Anda'
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <AlertNotification
            type="error"
            message={errorMessage}
            onClose={() => setErrorMessage(null)}
          />
        )}

        {/* Category Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Tipe Kategori
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4 text-red-500" />
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              Pemasukan
            </button>
          </div>
        </div>

        {/* Category Name */}
        <div>
          <Input
            label="Nama Kategori"
            type="text"
            placeholder="Contoh: Asuransi, Langganan Netflix, Bonus"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Color Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Warna Tema
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform cursor-pointer border-2 ${
                  color === c ? 'scale-110 border-gray-900 shadow-sm' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Pilih warna ${c}`}
              />
            ))}
          </div>
        </div>

        {/* Icon Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Ikon Kategori
          </label>
          <div className="grid grid-cols-6 sm:grid-cols-9 gap-2 max-h-40 overflow-y-auto p-1 border border-gray-200 rounded-xl">
            {CATEGORY_ICONS.map((ic) => {
              const isSelected = icon === ic;
              return (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`p-2 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-100 ring-2 ring-blue-600'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title={ic}
                >
                  <CategoryIcon iconName={ic} type={type} color={color} size="sm" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5 pt-4 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto justify-center"
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            leftIcon={<Check className="w-4 h-4" />}
            className="font-semibold w-full sm:w-auto justify-center"
          >
            {categoryToEdit ? 'Simpan Perubahan' : 'Buat Kategori'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
