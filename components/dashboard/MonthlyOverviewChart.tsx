'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardTitle } from '@/components/ui/Card';
import { MonthlyChartData, Transaction } from '@/lib/types';
import { formatCurrency, calculateDailyComparison, cn } from '@/lib/utils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  BarChart3,
  TrendingUp,
  Scale,
  Calendar,
} from 'lucide-react';

export type OverviewTimeframe = '7d' | '30d' | 'monthly';
export type OverviewChartView = 'area' | 'bar';

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
  const [chartView, setChartView] = useState<OverviewChartView>('area');
  const [visibleSeries, setVisibleSeries] = useState<{ income: boolean; expense: boolean }>({
    income: true,
    expense: true,
  });

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

  // Calculate totals for quick metric badges
  const totals = useMemo(() => {
    const totalIncome = chartData.reduce((acc, curr) => acc + (curr.income || 0), 0);
    const totalExpense = chartData.reduce((acc, curr) => acc + (curr.expense || 0), 0);
    const net = totalIncome - totalExpense;
    return { totalIncome, totalExpense, net };
  }, [chartData]);

  const formatYAxis = (tickItem: number) => {
    if (tickItem >= 1000000000) {
      return `${(tickItem / 1000000000).toFixed(1)} M`;
    }
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
      const inc = payload.find((p: any) => p.dataKey === 'income')?.value ?? (item?.income || 0);
      const exp = payload.find((p: any) => p.dataKey === 'expense')?.value ?? (item?.expense || 0);
      const net = inc - exp;
      const isSurplus = net >= 0;

      return (
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl shadow-gray-900/10 border border-gray-100 text-xs min-w-[210px] animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-1.5 text-gray-500 font-medium mb-2.5 pb-2 border-b border-gray-100">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-semibold text-gray-800">{displayTitle}</span>
          </div>

          <div className="space-y-2">
            {visibleSeries.income && (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs" />
                  <span className="text-gray-600 font-medium">Pemasukan</span>
                </div>
                <span className="font-bold text-emerald-600">{formatCurrency(inc)}</span>
              </div>
            )}

            {visibleSeries.expense && (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shadow-xs" />
                  <span className="text-gray-600 font-medium">Pengeluaran</span>
                </div>
                <span className="font-bold text-rose-600">{formatCurrency(exp)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-4">
              <span className="text-gray-500 font-medium flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-gray-400" />
                Selisih
              </span>
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded-md font-bold text-[11px]',
                  isSurplus ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                )}
              >
                {isSurplus ? '+' : ''}
                {formatCurrency(net)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const getTitleAndSubtitle = () => {
    if (timeframe === '7d') {
      return {
        title: 'Arus Kas Harian (7 Hari)',
        subtitle: 'Grafik transaksi harian per tanggal',
      };
    }
    if (timeframe === '30d') {
      return {
        title: 'Arus Kas Harian (30 Hari)',
        subtitle: 'Grafik transaksi harian per tanggal',
      };
    }
    return {
      title: 'Arus Kas Bulanan (6 Bulan)',
      subtitle: 'Tren komparasi pemasukan vs pengeluaran',
    };
  };

  const info = getTitleAndSubtitle();

  const toggleSeries = (series: 'income' | 'expense') => {
    if (visibleSeries[series] && !visibleSeries[series === 'income' ? 'expense' : 'income']) {
      return;
    }
    setVisibleSeries((prev) => ({
      ...prev,
      [series]: !prev[series],
    }));
  };

  return (
    <Card padding="none" className="overflow-hidden border border-gray-200/80 shadow-xs bg-white">
      {/* Header with Title and Modern Controls */}
      <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              {chartView === 'area' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <BarChart3 className="w-4 h-4" />
              )}
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">{info.title}</CardTitle>
              <p className="text-[11px] sm:text-xs text-gray-500">{info.subtitle}</p>
            </div>
          </div>
        </div>

        {/* View and Timeframe Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart Style Switcher (Area vs Bar) */}
          <div className="flex items-center gap-1 bg-gray-100/90 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setChartView('area')}
              title="Tampilan Garis Kurva Halus (Area)"
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer',
                chartView === 'area'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              )}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kurva</span>
            </button>
            <button
              type="button"
              onClick={() => setChartView('bar')}
              title="Tampilan Batang (Bar Chart)"
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer',
                chartView === 'bar'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              )}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Batang</span>
            </button>
          </div>

          {/* Timeframe Switcher (7 Hari, 30 Hari, Bulanan) */}
          <div className="flex items-center gap-1 bg-gray-100/90 p-1 rounded-xl text-xs font-semibold">
            {(['7d', '30d', 'monthly'] as OverviewTimeframe[]).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={cn(
                  'px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer text-center',
                  timeframe === tf
                    ? 'bg-white text-blue-600 shadow-xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {tf === '7d' ? '7 Hari' : tf === '30d' ? '30 Hari' : 'Bulanan'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Metric Bar (Stat Strip) */}
      {hasData && (
        <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-gray-50/70 via-gray-50 to-white border-b border-gray-100 grid grid-cols-3 gap-2 sm:gap-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 hidden sm:inline-block" />
            <span className="text-gray-500 text-[11px]">Masuk:</span>
            <span className="font-bold text-emerald-600 truncate">
              {formatCurrency(totals.totalIncome)}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 hidden sm:inline-block" />
            <span className="text-gray-500 text-[11px]">Keluar:</span>
            <span className="font-bold text-rose-600 truncate">
              {formatCurrency(totals.totalExpense)}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 justify-end sm:justify-start">
            <span className="text-gray-500 text-[11px]">Selisih:</span>
            <span
              className={cn(
                'font-bold truncate',
                totals.net >= 0 ? 'text-emerald-700' : 'text-rose-700'
              )}
            >
              {totals.net >= 0 ? '+' : ''}
              {formatCurrency(totals.net)}
            </span>
          </div>
        </div>
      )}

      {/* Chart Canvas Area */}
      <div className="p-3 sm:p-6">
        {!hasData ? (
          <EmptyState
            icon={BarChart3}
            title={
              timeframe === 'monthly'
                ? 'Belum ada data bulanan'
                : 'Belum ada data transaksi di periode ini'
            }
            description="Tambahkan catatan pemasukan dan pengeluaran Anda untuk melihat grafik analitik visual."
            actionLabel="Tambah Transaksi"
            onAction={onOpenAddModal}
          />
        ) : (
          <div className="space-y-3">
            {/* Interactive Custom Legend (Click to toggle) */}
            <div className="flex items-center justify-end gap-3 text-xs">
              <button
                type="button"
                onClick={() => toggleSeries('income')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer border',
                  visibleSeries.income
                    ? 'bg-emerald-50/80 border-emerald-200/80 text-emerald-800 font-semibold'
                    : 'bg-gray-50 border-gray-200 text-gray-400 opacity-60 line-through'
                )}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Pemasukan</span>
              </button>

              <button
                type="button"
                onClick={() => toggleSeries('expense')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer border',
                  visibleSeries.expense
                    ? 'bg-rose-50/80 border-rose-200/80 text-rose-800 font-semibold'
                    : 'bg-gray-50 border-gray-200 text-gray-400 opacity-60 line-through'
                )}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Pengeluaran</span>
              </button>
            </div>

            {/* Recharts Canvas */}
            <div className="h-60 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartView === 'area' ? (
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -22, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="overviewIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="overviewExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="4 4"
                      vertical={false}
                      stroke="#F1F5F9"
                    />
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
                    {visibleSeries.income && (
                      <Area
                        type="monotone"
                        dataKey="income"
                        name="Pemasukan"
                        stroke="#10B981"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#overviewIncomeGrad)"
                        activeDot={{
                          r: 5,
                          stroke: '#10B981',
                          strokeWidth: 2.5,
                          fill: '#FFFFFF',
                        }}
                      />
                    )}
                    {visibleSeries.expense && (
                      <Area
                        type="monotone"
                        dataKey="expense"
                        name="Pengeluaran"
                        stroke="#F43F5E"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#overviewExpenseGrad)"
                        activeDot={{
                          r: 5,
                          stroke: '#F43F5E',
                          strokeWidth: 2.5,
                          fill: '#FFFFFF',
                        }}
                      />
                    )}
                  </AreaChart>
                ) : (
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -22, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="overviewIncomeBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34D399" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                      <linearGradient id="overviewExpenseBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FB7185" />
                        <stop offset="100%" stopColor="#E11D48" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="4 4"
                      vertical={false}
                      stroke="#F1F5F9"
                    />
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
                    {visibleSeries.income && (
                      <Bar
                        dataKey="income"
                        name="Pemasukan"
                        fill="url(#overviewIncomeBar)"
                        radius={[5, 5, 0, 0]}
                        maxBarSize={timeframe === '30d' ? 14 : 26}
                      />
                    )}
                    {visibleSeries.expense && (
                      <Bar
                        dataKey="expense"
                        name="Pengeluaran"
                        fill="url(#overviewExpenseBar)"
                        radius={[5, 5, 0, 0]}
                        maxBarSize={timeframe === '30d' ? 14 : 26}
                      />
                    )}
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
