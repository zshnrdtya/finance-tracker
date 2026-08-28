'use client';

import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { MonthlyChartData } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { EmptyState } from '@/components/ui/EmptyState';
import { BarChart2 } from 'lucide-react';

interface IncomeExpenseBarChartProps {
  data: MonthlyChartData[];
  monthCount?: number;
  onMonthCountChange?: (count: number) => void;
}

export const IncomeExpenseBarChart: React.FC<IncomeExpenseBarChartProps> = ({
  data,
  monthCount = 6,
  onMonthCountChange,
}) => {
  const hasData = data.some((d) => d.income > 0 || d.expense > 0);

  const formatYAxis = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return val.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const inc = payload.find((p: any) => p.dataKey === 'income')?.value || 0;
      const exp = payload.find((p: any) => p.dataKey === 'expense')?.value || 0;
      const net = inc - exp;

      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 text-xs">
          <p className="font-bold text-gray-900 mb-2 border-b border-gray-100 pb-1.5">{label}</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-6">
              <span className="text-emerald-600 font-medium">Income:</span>
              <span className="font-bold text-emerald-700">{formatCurrency(inc)}</span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-red-600 font-medium">Expense:</span>
              <span className="font-bold text-red-700">{formatCurrency(exp)}</span>
            </div>
            <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between gap-6">
              <span className="text-gray-500 font-medium">Net Savings:</span>
              <span
                className={`font-bold ${
                  net >= 0 ? 'text-indigo-600' : 'text-red-600'
                }`}
              >
                {formatCurrency(net)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle>Income vs. Expense Trend</CardTitle>
          <p className="text-xs text-gray-500 mt-0.5">
            Comparative analysis over the last {monthCount} months
          </p>
        </div>

        {onMonthCountChange && (
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg self-start sm:self-auto text-xs">
            {[3, 6, 12].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => onMonthCountChange(num)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  monthCount === num
                    ? 'bg-white text-blue-600 shadow-xs font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {num}M
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 sm:p-6">
        {!hasData ? (
          <EmptyState
            icon={BarChart2}
            title="No comparative data yet"
            description="Add your transactions across months to generate visual trend comparisons."
          />
        ) : (
          <div className="h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748B' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatYAxis}
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '20px', fontSize: '12px' }}
                />
                <Bar
                  dataKey="income"
                  name="Income (Pemasukan)"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
                <Bar
                  dataKey="expense"
                  name="Expense (Pengeluaran)"
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  );
};
