'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { AlertNotification } from '@/components/ui/Toast';
import { Category, Transaction, TransactionType } from '@/lib/types';
import { toDateInputValue, formatNumberWithDots, parseCurrencyInput, formatCurrency } from '@/lib/utils';
import { ArrowUpRight, ArrowDownLeft, Calendar, Tag, FileText, Check } from 'lucide-react';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
  transactionToEdit?: Transaction | null;
  userId: string;
  onSave: (transactionData: {
    type: TransactionType;
    amount: number;
    category_id: string;
    description: string;
    date: string;
  }) => Promise<{ error?: string | null }>;
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  categories,
  transactionToEdit,
  userId,
  onSave,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(toDateInputValue());
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter categories by selected type
  const availableCategories = categories.filter((cat) => cat.type === type);

  // Check if selected category is "Other" / "Lainnya"
  const selectedCategoryObj = categories.find((c) => c.id === categoryId);
  const isOtherCategory =
    selectedCategoryObj?.name.toLowerCase().includes('lainnya') ||
    selectedCategoryObj?.name.toLowerCase().includes('other');

  // Initialize or reset form when modal opens or transactionToEdit changes
  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.category?.type || 'expense');
      setAmount(formatNumberWithDots(transactionToEdit.amount));
      setCategoryId(transactionToEdit.category_id);
      setDescription(transactionToEdit.description || '');
      setDate(
        transactionToEdit.date
          ? toDateInputValue(transactionToEdit.date)
          : toDateInputValue()
      );
    } else {
      setType('expense');
      setAmount('');
      setDescription('');
      setDate(toDateInputValue());
      // Set default category for expense
      const defaultCat = categories.find((c) => c.type === 'expense');
      setCategoryId(defaultCat ? defaultCat.id : '');
    }
    setErrorMessage(null);
  }, [transactionToEdit, isOpen, categories]);

  // When type changes, ensure selected category matches new type
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const firstCat = categories.find((c) => c.type === newType);
    setCategoryId(firstCat ? firstCat.id : '');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const formatted = formatNumberWithDots(rawVal);
    setAmount(formatted);
  };

  const parsedAmountNumber = parseCurrencyInput(amount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const parsedAmount = parseCurrencyInput(amount);
    if (parsedAmount <= 0) {
      setErrorMessage('Masukkan nominal yang valid lebih besar dari 0.');
      return;
    }

    if (!categoryId) {
      setErrorMessage('Silakan pilih salah satu kategori.');
      return;
    }

    if (!date) {
      setErrorMessage('Pilih tanggal transaksi yang valid.');
      return;
    }

    if (isOtherCategory && (!description || description.trim().length === 0)) {
      setErrorMessage('Mohon tuliskan keterangan / sumber dana untuk kategori "Lainnya".');
      return;
    }

    setIsLoading(true);

    try {
      const res = await onSave({
        type,
        amount: parsedAmount,
        category_id: categoryId,
        description: description.trim(),
        date: new Date(date).toISOString(),
      });

      if (res.error) {
        setErrorMessage(res.error);
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal menyimpan transaksi');
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transactionToEdit ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
      description={
        transactionToEdit
          ? 'Perbarui detail data transaksi yang dipilih'
          : 'Catat pemasukan atau pengeluaran baru di akun Anda'
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

        {/* Transaction Type Segmented Toggle */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Tipe Transaksi
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
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
              onClick={() => handleTypeChange('income')}
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

        {/* Amount Input */}
        <div>
          <Input
            label="Nominal (Rp)"
            type="text"
            inputMode="numeric"
            placeholder="Contoh: 50.000 atau 74.000"
            value={amount}
            onChange={handleAmountChange}
            className="text-lg font-bold text-gray-900 tracking-tight"
            helperText={
              parsedAmountNumber > 0
                ? `Nominal tersimpan: ${formatCurrency(parsedAmountNumber)}`
                : 'Format otomatis ribuan (contoh: 74.000)'
            }
            required
          />

          {/* Quick preset amount buttons */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[11px] text-gray-400 mr-1">Cepat:</span>
            {[10000, 20000, 50000, 74000, 100000, 500000, 1000000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(formatNumberWithDots(preset))}
                className="px-2 py-0.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-transparent transition-all cursor-pointer"
              >
                +{formatNumberWithDots(preset)}
              </button>
            ))}
          </div>
        </div>

        {/* Category Dropdown */}
        <div>
          <Select
            label="Kategori"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            leftIcon={<Tag className="w-4 h-4" />}
            required
          >
            {availableCategories.length === 0 ? (
              <option value="" disabled>
                Tidak ada kategori untuk {type === 'income' ? 'pemasukan' : 'pengeluaran'}
              </option>
            ) : (
              availableCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))
            )}
          </Select>
        </div>

        {/* Dynamic Other / Custom Description Field */}
        <div>
          <Input
            label={
              isOtherCategory
                ? 'Keterangan / Sumber (Wajib untuk "Lainnya")'
                : 'Keterangan / Catatan (Opsional)'
            }
            type="text"
            placeholder={
              isOtherCategory
                ? type === 'income'
                  ? 'Contoh: Dikasih teman, Jual barang bekas'
                  : 'Contoh: Beli pulsa darurat, Donasi'
                : 'Contoh: Makan siang, Bensin, Gaji Pokok'
            }
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            leftIcon={<FileText className="w-4 h-4" />}
            required={isOtherCategory}
            helperText={
              isOtherCategory
                ? 'Jelaskan tujuan atau asal dana transaksi kategori "Lainnya" ini.'
                : undefined
            }
          />
        </div>

        {/* Date Input */}
        <div>
          <Input
            label="Tanggal"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4" />}
            required
          />
        </div>

        {/* Action Buttons */}
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
            {transactionToEdit ? 'Simpan Perubahan' : 'Tambah Transaksi'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
