export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType;
  color?: string;
  icon?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  description: string | null;
  date: string;
  created_at?: string;
  updated_at?: string;
  category?: Category;
}

export interface TransactionFormData {
  type: TransactionType;
  amount: number | string;
  category_id: string;
  description?: string;
  date: string;
}

export interface CategoryFormData {
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
}

export interface SummaryStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  netSavings: number;
  savingsRate: number;
  transactionCount: number;
  todayIncome?: number;
  todayExpense?: number;
  dailyAverageExpense?: number;
  monthlyTransactionCount?: number;
}

export interface CategoryExpenseBreakdown {
  id: string;
  name: string;
  color: string;
  total: number;
  percentage: number;
  count: number;
}

export interface MonthlyChartData {
  month: string; // e.g. 'Jan 2026'
  income: number;
  expense: number;
  net: number;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}
