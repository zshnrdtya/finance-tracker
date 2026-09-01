'use client';

import React from 'react';
import { Card, CardTitle } from '@/components/ui/Card';
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
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)} jt`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)} rb`;
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
              <span className="text-emerald-600 font-medium">Pemasukan:</span>
              <span className="font-bold text-emerald-700">{formatCurrency(inc)}</span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-red-600 font-medium">Pengeluaran:</span>
              <span className="font-bold text-red-700">{formatCurrency(exp)}</span>
            </div>
            <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between gap-6">
              <span className="text-gray-500 font-medium">Tabungan Bersih:</span>
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
      <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-base sm:text-lg">Tren Pemasukan vs. Pengeluaran</CardTitle>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
            Analisis perbandingan selama {monthCount} bulan terakhir
          </p>
        </div>

        {onMonthCountChange && (
          <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-full sm:w-auto text-xs">
            {[3, 6, 12].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => onMonthCountChange(num)}
                className={`py-1.5 px-2 text-center rounded-md font-medium transition-all cursor-pointer ${
                  monthCount === num
                    ? 'bg-white text-blue-600 shadow-xs font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {num} Bulan
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 sm:p-6">
        {!hasData ? (
          <EmptyState
            icon={BarChart2}
            title="Tidak ada data perbandingan"
            description="Tambahkan transaksi untuk beberapa bulan berbeda untuk melihat perbandingan arus kas."
          />
        ) : (
          <div className="h-60 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 5, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatYAxis}
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
                />
                <Bar
                  dataKey="income"
                  name="Pemasukan"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={26}
                />
                <Bar
                  dataKey="expense"
                  name="Pengeluaran"
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={26}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  );
};
