'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { CategoryList } from '@/components/categories/CategoryList';
import { CategoryFormModal } from '@/components/categories/CategoryFormModal';
import { Category, TransactionType } from '@/lib/types';
import { FolderKanban } from 'lucide-react';

export default function CategoriesPage() {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
  };

  const handleSaveModal = async (data: {
    name: string;
    type: TransactionType;
    color: string;
    icon: string;
  }) => {
    if (editingCategory) {
      return await updateCategory(editingCategory.id, data);
    } else {
      return await addCategory(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Category Management
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Customize your income and expense categories to fit your personal or household budgeting.
        </p>
      </div>

      {/* Category List */}
      <CategoryList
        categories={categories}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onEditCategory={handleEdit}
        onDeleteCategory={async (id) => {
          return await deleteCategory(id);
        }}
      />

      {/* Add / Edit Category Modal */}
      {(isAddModalOpen || editingCategory) && (
        <CategoryFormModal
          isOpen={isAddModalOpen || Boolean(editingCategory)}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingCategory(null);
          }}
          categoryToEdit={editingCategory}
          onSave={handleSaveModal}
        />
      )}
    </div>
  );
}
