import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Transaction, Category, SummaryStats, CategoryExpenseBreakdown, MonthlyChartData } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number into Indonesian Rupiah currency string (e.g. Rp 1.500.000)
 */
export function formatCurrency(amount: number, currency: 'IDR' | 'USD' = 'IDR'): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return currency === 'IDR' ? 'Rp 0' : '$0.00';
  }

  if (currency === 'IDR') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a raw number or string with Indonesian dot thousand separators (e.g. 74000 -> "74.000")
 */
export function formatNumberWithDots(value: number | string | null | undefined): string {
  if (value === '' || value === null || value === undefined) return '';
  const digits = value.toString().replace(/\D/g, '');
  if (!digits) return '';
  return new Intl.NumberFormat('id-ID').format(Number(digits));
}

/**
 * Parses user input currency string into clean integer amount.
 * Prevents Indonesian thousand separators ("74.000" or "74,000") from being parsed as decimals ("74").
 */
export function parseCurrencyInput(value: string | number | null | undefined): number {
  if (value === '' || value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  const digits = value.toString().replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}

/**
 * Formats a date string or Date object into human-readable format
 */
export function formatDate(
  dateInput: string | Date,
  format: 'short' | 'long' | 'relative' = 'short',
  locale: string = 'id-ID'
): string {
  if (!dateInput) return '-';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '-';

  if (format === 'short') {
    return d.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  if (format === 'long') {
    return d.toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  return d.toLocaleDateString(locale);
}

/**
 * Returns YYYY-MM-DD string for HTML date input
 */
export function toDateInputValue(dateInput: string | Date = new Date()): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
  return d.toISOString().split('T')[0];
}

/**
 * Calculates total balance, current month income, current month expense, and savings rate
 */
export function calculateSummaryStats(transactions: Transaction[]): SummaryStats {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let totalIncome = 0;
  let totalExpense = 0;
  let monthlyIncome = 0;
  let monthlyExpense = 0;

  for (const t of transactions) {
    const amount = Number(t.amount) || 0;
    const isIncome = t.category?.type === 'income';
    const tDate = new Date(t.date);
    const isThisMonth =
      !isNaN(tDate.getTime()) &&
      tDate.getFullYear() === currentYear &&
      tDate.getMonth() === currentMonth;

    if (isIncome) {
      totalIncome += amount;
      if (isThisMonth) {
        monthlyIncome += amount;
      }
    } else {
      totalExpense += amount;
      if (isThisMonth) {
        monthlyExpense += amount;
      }
    }
  }

  const totalBalance = totalIncome - totalExpense;
  const netSavings = monthlyIncome - monthlyExpense;
  const savingsRate =
    monthlyIncome > 0 ? Math.max(0, Math.round((netSavings / monthlyIncome) * 100)) : 0;

  return {
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    netSavings,
    savingsRate,
    transactionCount: transactions.length,
  };
}

/**
 * Calculates expense breakdown by category for Pie Chart
 */
export function calculateCategoryBreakdown(
  transactions: Transaction[],
  categories: Category[],
  type: 'expense' | 'income' = 'expense',
  selectedMonthYear?: { year: number; month: number }
): CategoryExpenseBreakdown[] {
  const categoryMap = new Map<string, { name: string; color: string; total: number; count: number }>();

  // Filter transactions
  const filtered = transactions.filter((t) => {
    if (t.category?.type !== type) return false;
    if (selectedMonthYear) {
      const d = new Date(t.date);
      if (
        isNaN(d.getTime()) ||
        d.getFullYear() !== selectedMonthYear.year ||
        d.getMonth() !== selectedMonthYear.month
      ) {
        return false;
      }
    }
    return true;
  });

  let grandTotal = 0;

  for (const t of filtered) {
    const amount = Number(t.amount) || 0;
    grandTotal += amount;
    const catId = t.category_id;
    const catName = t.category?.name || 'Lainnya';
    const catColor = t.category?.color || '#64748B';

    const existing = categoryMap.get(catId);
    if (existing) {
      existing.total += amount;
      existing.count += 1;
    } else {
      categoryMap.set(catId, {
        name: catName,
        color: catColor,
        total: amount,
        count: 1,
      });
    }
  }

  const result: CategoryExpenseBreakdown[] = [];
  categoryMap.forEach((val, id) => {
    const percentage = grandTotal > 0 ? Math.round((val.total / grandTotal) * 100) : 0;
    result.push({
      id,
      name: val.name,
      color: val.color,
      total: val.total,
      percentage,
      count: val.count,
    });
  });

  // Sort descending by total amount
  return result.sort((a, b) => b.total - a.total);
}

/**
 * Groups transactions into monthly buckets for Bar Chart comparison (last N months)
 */
export function calculateMonthlyComparison(
  transactions: Transaction[],
  monthCount: number = 6
): MonthlyChartData[] {
  const now = new Date();
  const months: MonthlyChartData[] = [];

  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
    months.push({
      month: monthLabel,
      income: 0,
      expense: 0,
      net: 0,
    });
  }

  for (const t of transactions) {
    const tDate = new Date(t.date);
    if (isNaN(tDate.getTime())) continue;

    const amount = Number(t.amount) || 0;
    const isIncome = t.category?.type === 'income';

    for (let i = 0; i < monthCount; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1 - i), 1);
      if (tDate.getFullYear() === d.getFullYear() && tDate.getMonth() === d.getMonth()) {
        if (isIncome) {
          months[i].income += amount;
        } else {
          months[i].expense += amount;
        }
        months[i].net = months[i].income - months[i].expense;
        break;
      }
    }
  }

  return months;
}
