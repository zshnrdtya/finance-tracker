'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { AlertNotification } from '@/components/ui/Toast';
import { Category, Transaction, TransactionType } from '@/lib/types';
import { toDateInputValue } from '@/lib/utils';
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
      setAmount(transactionToEdit.amount.toString());
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const parsedAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Please enter a valid amount greater than 0.');
      return;
    }

    if (!categoryId) {
      setErrorMessage('Please select a category.');
      return;
    }

    if (!date) {
      setErrorMessage('Please choose a valid transaction date.');
      return;
    }

    if (isOtherCategory && (!description || description.trim().length === 0)) {
      setErrorMessage('Please describe the source / reason for "Other" category.');
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
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save transaction');
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transactionToEdit ? 'Edit Transaction' : 'Add New Transaction'}
      description={
        transactionToEdit
          ? 'Modify details for this transaction entry'
          : 'Record a new income or expense in your tracker'
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
            Transaction Type
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
              Expense (Pengeluaran)
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
              Income (Pemasukan)
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <Input
            label="Amount (Rp)"
            type="number"
            min="1"
            step="any"
            placeholder="e.g. 50000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-lg font-semibold"
            required
          />
        </div>

        {/* Category Dropdown */}
        <div>
          <Select
            label="Category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            leftIcon={<Tag className="w-4 h-4" />}
            required
          >
            {availableCategories.length === 0 ? (
              <option value="" disabled>
                No categories found for {type}
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
                ? 'Description / Detail (Required for "Other")'
                : 'Description / Note (Optional)'
            }
            type="text"
            placeholder={
              isOtherCategory
                ? type === 'income'
                  ? 'e.g. Dikasih teman, Jual barang bekas'
                  : 'e.g. Beli pulsa darurat, Donasi'
                : 'e.g. Makan siang, Bensin, Gaji Pokok'
            }
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            leftIcon={<FileText className="w-4 h-4" />}
            required={isOtherCategory}
            helperText={
              isOtherCategory
                ? 'Please specify what this "Other" transaction was for.'
                : undefined
            }
          />
        </div>

        {/* Date Input */}
        <div>
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4" />}
            required
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            leftIcon={<Check className="w-4 h-4" />}
          >
            {transactionToEdit ? 'Save Changes' : 'Add Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
