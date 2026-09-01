'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardTitle } from '@/components/ui/Card';
import { MonthlyChartData, Transaction } from '@/lib/types';
import { formatCurrency, calculateDailyComparison, cn } from '@/lib/utils';
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
import { BarChart3 } from 'lucide-react';

export type OverviewTimeframe = '7d' | '30d' | 'monthly';

interface MonthlyOverviewChartProps {
  data: MonthlyChartData[];
  transactions?: Transaction[];
  onOpenAddModal: () => void;
}

export const MonthlyOverviewChart: React.FC<MonthlyOverviewChartProps> = ({
  data,
  transactions = [],
  onOpenAddModal,
}) => {
  const [timeframe, setTimeframe] = useState<OverviewTimeframe>('7d');

  const chartData = useMemo(() => {
    if (timeframe === '7d') {
      return calculateDailyComparison(transactions, 7);
    }
    if (timeframe === '30d') {
      return calculateDailyComparison(transactions, 30);
    }
    return data.map((d) => ({
      label: d.month,
      fullDate: d.month,
      income: d.income,
      expense: d.expense,
      net: d.net,
    }));
  }, [timeframe, transactions, data]);

  const hasData = chartData.some((d) => d.income > 0 || d.expense > 0);

  const formatYAxis = (tickItem: number) => {
    if (tickItem >= 1000000) {
      return `${(tickItem / 1000000).toFixed(1)} jt`;
    }
    if (tickItem >= 1000) {
      return `${(tickItem / 1000).toFixed(0)} rb`;
    }
    return tickItem.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0]?.payload;
      const displayTitle = item?.fullDate || label;
      const inc = payload.find((p: any) => p.dataKey === 'income')?.value || 0;
      const exp = payload.find((p: any) => p.dataKey === 'expense')?.value || 0;
      const net = inc - exp;

      return (
        <div className="bg-white p-3.5 rounded-xl shadow-lg border border-gray-100 text-xs min-w-[190px]">
          <p className="font-bold text-gray-900 mb-2 border-b border-gray-100 pb-1.5">{displayTitle}</p>
          <div className="space-y-1.5">
            <p className="text-emerald-600 font-semibold flex items-center justify-between gap-4">
              <span>Pemasukan:</span>
              <span className="font-bold">{formatCurrency(inc)}</span>
            </p>
            <p className="text-red-600 font-semibold flex items-center justify-between gap-4">
              <span>Pengeluaran:</span>
              <span className="font-bold">{formatCurrency(exp)}</span>
            </p>
            <p className="text-indigo-600 font-semibold flex items-center justify-between gap-4 pt-1 border-t border-gray-100">
              <span className="text-gray-500 font-normal">Selisih Bersih:</span>
              <span className="font-bold">{formatCurrency(net)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const getTitleAndSubtitle = () => {
    if (timeframe === '7d') {
      return {
        title: 'Arus Kas Harian (7 Hari Terakhir)',
        subtitle: 'Grafik transaksi harian per tanggal',
      };
    }
    if (timeframe === '30d') {
      return {
        title: 'Arus Kas Harian (30 Hari Terakhir)',
        subtitle: 'Grafik transaksi harian per tanggal',
      };
    }
    return {
      title: 'Arus Kas Bulanan (6 Bulan Terakhir)',
      subtitle: 'Tren pemasukan vs pengeluaran per bulan',
    };
  };

  const info = getTitleAndSubtitle();

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-base sm:text-lg">{info.title}</CardTitle>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">{info.subtitle}</p>
        </div>

        {/* View Toggle (7 Hari, 30 Hari, Bulanan) */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-full sm:w-auto justify-between sm:justify-start text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTimeframe('7d')}
            className={cn(
              'px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer flex-1 sm:flex-initial text-center',
              timeframe === '7d'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            7 Hari
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('30d')}
            className={cn(
              'px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer flex-1 sm:flex-initial text-center',
              timeframe === '30d'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            30 Hari
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('monthly')}
            className={cn(
              'px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer flex-1 sm:flex-initial text-center',
              timeframe === 'monthly'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Bulanan
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-6">
        {!hasData ? (
          <EmptyState
            icon={BarChart3}
            title={timeframe === 'monthly' ? 'Belum ada data bulanan' : 'Belum ada data transaksi di periode ini'}
            description="Tambahkan catatan pemasukan dan pengeluaran Anda untuk melihat grafik analitik visual."
            actionLabel="Tambah Transaksi"
            onAction={onOpenAddModal}
          />
        ) : (
          <div className="h-56 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 5, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: timeframe === '30d' ? 9 : 11, fill: '#64748B' }}
                  interval={timeframe === '30d' ? 2 : 0}
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
                  maxBarSize={timeframe === '30d' ? 14 : 28}
                />
                <Bar
                  dataKey="expense"
                  name="Pengeluaran"
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={timeframe === '30d' ? 14 : 28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  );
};
