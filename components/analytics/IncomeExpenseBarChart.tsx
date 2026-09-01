'use client';

import React from 'react';
import { Card, CardTitle } from '@/components/ui/Card';
import { MonthlyChartData } from '@/lib/types';
import { formatCurrency, CashFlowDataPoint, cn } from '@/lib/utils';
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

export type AnalyticsPeriod = '7d' | '30d' | '3m' | '6m' | '12m';

interface IncomeExpenseBarChartProps {
  data: (MonthlyChartData | CashFlowDataPoint)[];
  period?: AnalyticsPeriod;
  onPeriodChange?: (period: AnalyticsPeriod) => void;
  monthCount?: number;
  onMonthCountChange?: (count: number) => void;
}

export const IncomeExpenseBarChart: React.FC<IncomeExpenseBarChartProps> = ({
  data,
  period = '30d',
  onPeriodChange,
  monthCount,
  onMonthCountChange,
}) => {
  // Normalize chart data items so each item has a label and optional fullDate
  const normalizedData = data.map((item) => {
    const label = 'label' in item ? item.label : (item as MonthlyChartData).month;
    const fullDate = 'fullDate' in item ? item.fullDate : label;
    return {
      label,
      fullDate,
      income: item.income,
      expense: item.expense,
      net: item.net,
    };
  });

  const hasData = normalizedData.some((d) => d.income > 0 || d.expense > 0);
  const isDaily = period === '7d' || period === '30d';

  const formatYAxis = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)} jt`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)} rb`;
    return val.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0]?.payload;
      const displayTitle = item?.fullDate || label;
      const inc = payload.find((p: any) => p.dataKey === 'income')?.value || 0;
      const exp = payload.find((p: any) => p.dataKey === 'expense')?.value || 0;
      const net = inc - exp;

      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 text-xs min-w-[200px]">
          <p className="font-bold text-gray-900 mb-2 border-b border-gray-100 pb-1.5">{displayTitle}</p>
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

  const getHeaderInfo = () => {
    if (period === '7d') {
      return {
        title: 'Tren Harian Pemasukan vs. Pengeluaran (7 Hari Terakhir)',
        subtitle: 'Grafik perbandingan per tanggal dalam 7 hari terakhir',
      };
    }
    if (period === '30d') {
      return {
        title: 'Tren Harian Pemasukan vs. Pengeluaran (30 Hari Terakhir)',
        subtitle: 'Grafik perbandingan per tanggal dalam 30 hari terakhir',
      };
    }
    const months = period === '3m' ? 3 : period === '6m' ? 6 : 12;
    return {
      title: 'Tren Bulanan Pemasukan vs. Pengeluaran',
      subtitle: `Analisis perbandingan bulanan selama ${months} bulan terakhir`,
    };
  };

  const headerInfo = getHeaderInfo();

  const periodOptions: { key: AnalyticsPeriod; label: string }[] = [
    { key: '7d', label: '7 Hari' },
    { key: '30d', label: '30 Hari' },
    { key: '3m', label: '3 Bulan' },
    { key: '6m', label: '6 Bulan' },
    { key: '12m', label: '12 Bulan' },
  ];

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-base sm:text-lg">{headerInfo.title}</CardTitle>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
            {headerInfo.subtitle}
          </p>
        </div>

        {/* Period Switcher (Harian per tanggal vs Bulanan) */}
        {onPeriodChange ? (
          <div className="flex flex-wrap items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
            {periodOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => onPeriodChange(opt.key)}
                className={cn(
                  'py-1.5 px-2.5 rounded-lg transition-all cursor-pointer text-center',
                  period === opt.key
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : onMonthCountChange ? (
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
        ) : null}
      </div>

      <div className="p-3 sm:p-6">
        {!hasData ? (
          <EmptyState
            icon={BarChart2}
            title={isDaily ? 'Tidak ada data di rentang tanggal ini' : 'Tidak ada data perbandingan bulanan'}
            description="Tambahkan catatan transaksi Anda untuk melihat grafik analitik visual."
          />
        ) : (
          <div className="h-60 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={normalizedData} margin={{ top: 10, right: 5, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: period === '30d' ? 9 : 11, fill: '#64748B' }}
                  interval={period === '30d' ? 2 : 0}
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
                  maxBarSize={period === '30d' ? 14 : 26}
                />
                <Bar
                  dataKey="expense"
                  name="Pengeluaran"
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={period === '30d' ? 14 : 26}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  );
};
