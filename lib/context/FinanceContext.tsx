'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Category,
  Transaction,
  SummaryStats,
  CategoryExpenseBreakdown,
  MonthlyChartData,
  TransactionType,
} from '@/lib/types';
import {
  calculateSummaryStats,
  calculateCategoryBreakdown,
  calculateMonthlyComparison,
} from '@/lib/utils';
import { DEFAULT_INCOME_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES } from '@/lib/constants';

interface FinanceContextType {
  user: any | null;
  isLoading: boolean;
  categories: Category[];
  transactions: Transaction[];
  stats: SummaryStats;
  expenseBreakdown: CategoryExpenseBreakdown[];
  incomeBreakdown: CategoryExpenseBreakdown[];
  monthlyChartData: MonthlyChartData[];
  isAddTransactionOpen: boolean;
  openAddTransaction: () => void;
  closeAddTransaction: () => void;
  fetchData: () => Promise<void>;
  addTransaction: (data: {
    type: TransactionType;
    amount: number;
    category_id: string;
    description: string;
    date: string;
  }) => Promise<{ error?: string | null }>;
  updateTransaction: (
    id: string,
    data: {
      type: TransactionType;
      amount: number;
      category_id: string;
      description: string;
      date: string;
    }
  ) => Promise<{ error?: string | null }>;
  deleteTransaction: (id: string) => Promise<{ error?: string | null }>;
  addCategory: (data: {
    name: string;
    type: TransactionType;
    color: string;
    icon: string;
  }) => Promise<{ error?: string | null }>;
  updateCategory: (
    id: string,
    data: {
      name: string;
      type: TransactionType;
      color: string;
      icon: string;
    }
  ) => Promise<{ error?: string | null }>;
  deleteCategory: (id: string) => Promise<{ error?: string | null }>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);

  const supabase = createClient();

  const openAddTransaction = () => setIsAddTransactionOpen(true);
  const closeAddTransaction = () => setIsAddTransactionOpen(false);

  // Fetch initial user and data
  const fetchData = useCallback(async () => {
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      setUser(currentUser);

      if (!currentUser) {
        setCategories([]);
        setTransactions([]);
        setIsLoading(false);
        return;
      }

      // 1. Fetch Categories for this user
      const { data: categoriesData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('name', { ascending: true });

      let currentCategories: Category[] = categoriesData || [];

      // If user has no categories, seed them automatically
      if (!catError && currentCategories.length === 0) {
        const seedCategories = [
          ...DEFAULT_INCOME_CATEGORIES.map((c) => ({
            user_id: currentUser.id,
            name: c.name,
            type: 'income' as TransactionType,
            color: c.color,
            icon: c.icon,
          })),
          ...DEFAULT_EXPENSE_CATEGORIES.map((c) => ({
            user_id: currentUser.id,
            name: c.name,
            type: 'expense' as TransactionType,
            color: c.color,
            icon: c.icon,
          })),
        ];

        const { data: inserted, error: seedError } = await supabase
          .from('categories')
          .insert(seedCategories)
          .select('*');

        if (!seedError && inserted) {
          currentCategories = inserted;
        }
      }

      setCategories(currentCategories);

      // 2. Fetch Transactions for this user (with category join)
      const { data: transactionsData, error: transError } = await supabase
        .from('transactions')
        .select('*, category:categories(*)')
        .eq('user_id', currentUser.id)
        .order('date', { ascending: false });

      if (!transError && transactionsData) {
        setTransactions(transactionsData);
      }
    } catch (err) {
      console.error('Error fetching finance data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchData();
      } else {
        setUser(null);
        setCategories([]);
        setTransactions([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData, supabase]);

  // Transaction CRUD Operations
  const addTransaction = async (data: {
    type: TransactionType;
    amount: number;
    category_id: string;
    description: string;
    date: string;
  }) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { data: inserted, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          category_id: data.category_id,
          amount: data.amount,
          description: data.description || null,
          date: data.date,
        })
        .select('*, category:categories(*)')
        .single();

      if (error) throw error;

      if (inserted) {
        setTransactions((prev) => [inserted, ...prev]);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Failed to add transaction' };
    }
  };

  const updateTransaction = async (
    id: string,
    data: {
      type: TransactionType;
      amount: number;
      category_id: string;
      description: string;
      date: string;
    }
  ) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { data: updated, error } = await supabase
        .from('transactions')
        .update({
          category_id: data.category_id,
          amount: data.amount,
          description: data.description || null,
          date: data.date,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select('*, category:categories(*)')
        .single();

      if (error) throw error;

      if (updated) {
        setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Failed to update transaction' };
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTransactions((prev) => prev.filter((t) => t.id !== id));
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Failed to delete transaction' };
    }
  };

  // Category CRUD Operations
  const addCategory = async (data: {
    name: string;
    type: TransactionType;
    color: string;
    icon: string;
  }) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { data: inserted, error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name: data.name,
          type: data.type,
          color: data.color,
          icon: data.icon,
        })
        .select('*')
        .single();

      if (error) throw error;

      if (inserted) {
        setCategories((prev) => [...prev, inserted]);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Failed to create category' };
    }
  };

  const updateCategory = async (
    id: string,
    data: {
      name: string;
      type: TransactionType;
      color: string;
      icon: string;
    }
  ) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { data: updated, error } = await supabase
        .from('categories')
        .update({
          name: data.name,
          type: data.type,
          color: data.color,
          icon: data.icon,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select('*')
        .single();

      if (error) throw error;

      if (updated) {
        setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
        // Also refresh transactions to reflect updated category details
        setTransactions((prev) =>
          prev.map((t) => (t.category_id === id ? { ...t, category: updated } : t))
        );
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Failed to update category' };
    }
  };

  const deleteCategory = async (id: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      // Check if any transaction is using this category
      const inUse = transactions.some((t) => t.category_id === id);
      if (inUse) {
        return {
          error:
            'This category is currently linked to existing transactions. Please delete or reassign those transactions first.',
        };
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setCategories((prev) => prev.filter((c) => c.id !== id));
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Failed to delete category' };
    }
  };

  // Calculated statistics and chart datasets
  const stats = calculateSummaryStats(transactions);
  const expenseBreakdown = calculateCategoryBreakdown(transactions, categories, 'expense');
  const incomeBreakdown = calculateCategoryBreakdown(transactions, categories, 'income');
  const monthlyChartData = calculateMonthlyComparison(transactions, 6);

  return (
    <FinanceContext.Provider
      value={{
        user,
        isLoading,
        categories,
        transactions,
        stats,
        expenseBreakdown,
        incomeBreakdown,
        monthlyChartData,
        isAddTransactionOpen,
        openAddTransaction,
        closeAddTransaction,
        fetchData,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
