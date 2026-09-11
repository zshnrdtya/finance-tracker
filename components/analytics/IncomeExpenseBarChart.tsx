'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardTitle } from '@/components/ui/Card';
import { MonthlyChartData } from '@/lib/types';
import { formatCurrency, CashFlowDataPoint, cn } from '@/lib/utils';
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
  Percent,
} from 'lucide-react';

export type AnalyticsPeriod = '7d' | '30d' | '3m' | '6m' | '12m';
export type AnalyticsChartView = 'area' | 'bar';

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
  const [chartView, setChartView] = useState<AnalyticsChartView>('area');
  const [visibleSeries, setVisibleSeries] = useState<{ income: boolean; expense: boolean }>({
    income: true,
    expense: true,
  });

  // Normalize chart data items so each item has a label and optional fullDate
  const normalizedData = useMemo(() => {
    return data.map((item) => {
      const label = 'label' in item ? item.label : (item as MonthlyChartData).month;
      const fullDate = 'fullDate' in item ? item.fullDate : label;
      return {
        label,
        fullDate,
        income: item.income || 0,
        expense: item.expense || 0,
        net: (item.income || 0) - (item.expense || 0),
      };
    });
  }, [data]);

  const hasData = normalizedData.some((d) => d.income > 0 || d.expense > 0);
  const isDaily = period === '7d' || period === '30d';

  // Calculate period totals and metrics
  const metrics = useMemo(() => {
    const totalIncome = normalizedData.reduce((acc, curr) => acc + curr.income, 0);
    const totalExpense = normalizedData.reduce((acc, curr) => acc + curr.expense, 0);
    const net = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((net / totalIncome) * 100)) : 0;

    return { totalIncome, totalExpense, net, savingsRate };
  }, [normalizedData]);

  const formatYAxis = (val: number) => {
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)} M`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)} jt`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)} rb`;
    return val.toString();
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
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl shadow-gray-900/10 border border-gray-100 text-xs min-w-[220px] animate-in fade-in zoom-in-95 duration-150">
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
                Tabungan Bersih
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

  const getHeaderInfo = () => {
    if (period === '7d') {
      return {
        title: 'Tren Arus Kas (7 Hari Terakhir)',
        subtitle: 'Grafik transaksi dan perbandingan per tanggal',
      };
    }
    if (period === '30d') {
      return {
        title: 'Tren Arus Kas (30 Hari Terakhir)',
        subtitle: 'Grafik transaksi dan perbandingan per tanggal',
      };
    }
    const months = period === '3m' ? 3 : period === '6m' ? 6 : 12;
    return {
      title: 'Tren Arus Kas Bulanan',
      subtitle: `Analisis perbandingan selama ${months} bulan terakhir`,
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
      {/* Header & Controls */}
      <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              {chartView === 'area' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <BarChart3 className="w-4 h-4" />
              )}
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">{headerInfo.title}</CardTitle>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                {headerInfo.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher & Period Switcher */}
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
                  ? 'bg-white text-indigo-600 shadow-xs'
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
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              )}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Batang</span>
            </button>
          </div>

          {/* Period Switcher */}
          {onPeriodChange ? (
            <div className="flex flex-wrap items-center gap-1 bg-gray-100/90 p-1 rounded-xl text-xs font-semibold">
              {periodOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => onPeriodChange(opt.key)}
                  className={cn(
                    'py-1.5 px-2.5 rounded-lg transition-all cursor-pointer text-center',
                    period === opt.key
                      ? 'bg-white text-indigo-600 shadow-xs font-bold'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          ) : onMonthCountChange ? (
            <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-gray-100/90 p-1 rounded-xl text-xs font-semibold">
              {[3, 6, 12].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => onMonthCountChange(num)}
                  className={cn(
                    'py-1.5 px-2.5 text-center rounded-lg font-semibold transition-all cursor-pointer',
                    monthCount === num
                      ? 'bg-white text-indigo-600 shadow-xs font-bold'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  {num} Bulan
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Quick Metrics Strip */}
      {hasData && (
        <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-gray-50/70 via-gray-50 to-white border-b border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs">
          <div className="flex flex-col">
            <span className="text-gray-500 text-[11px]">Total Masuk</span>
            <span className="font-bold text-emerald-600 truncate mt-0.5">
              {formatCurrency(metrics.totalIncome)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500 text-[11px]">Total Keluar</span>
            <span className="font-bold text-rose-600 truncate mt-0.5">
              {formatCurrency(metrics.totalExpense)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500 text-[11px]">Tabungan Bersih</span>
            <span
              className={cn(
                'font-bold truncate mt-0.5',
                metrics.net >= 0 ? 'text-emerald-700' : 'text-rose-700'
              )}
            >
              {metrics.net >= 0 ? '+' : ''}
              {formatCurrency(metrics.net)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500 text-[11px] flex items-center gap-1">
              <Percent className="w-3 h-3 text-gray-400" />
              Tingkat Tabungan
            </span>
            <span className="font-bold text-indigo-600 truncate mt-0.5">
              {metrics.savingsRate}%
            </span>
          </div>
        </div>
      )}

      {/* Chart Canvas */}
      <div className="p-3 sm:p-6">
        {!hasData ? (
          <EmptyState
            icon={BarChart3}
            title={
              isDaily
                ? 'Tidak ada data di rentang tanggal ini'
                : 'Tidak ada data perbandingan bulanan'
            }
            description="Tambahkan catatan transaksi Anda untuk melihat grafik analitik visual."
          />
        ) : (
          <div className="space-y-3">
            {/* Interactive Legend (Click to toggle) */}
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

            <div className="h-64 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartView === 'area' ? (
                  <AreaChart
                    data={normalizedData}
                    margin={{ top: 10, right: 10, left: -22, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="analyticsIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="analyticsExpenseGrad" x1="0" y1="0" x2="0" y2="1">
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
                    {visibleSeries.income && (
                      <Area
                        type="monotone"
                        dataKey="income"
                        name="Pemasukan"
                        stroke="#10B981"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#analyticsIncomeGrad)"
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
                        fill="url(#analyticsExpenseGrad)"
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
                    data={normalizedData}
                    margin={{ top: 10, right: 10, left: -22, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="analyticsIncomeBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34D399" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                      <linearGradient id="analyticsExpenseBar" x1="0" y1="0" x2="0" y2="1">
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
                    {visibleSeries.income && (
                      <Bar
                        dataKey="income"
                        name="Pemasukan"
                        fill="url(#analyticsIncomeBar)"
                        radius={[5, 5, 0, 0]}
                        maxBarSize={period === '30d' ? 14 : 26}
                      />
                    )}
                    {visibleSeries.expense && (
                      <Bar
                        dataKey="expense"
                        name="Pengeluaran"
                        fill="url(#analyticsExpenseBar)"
                        radius={[5, 5, 0, 0]}
                        maxBarSize={period === '30d' ? 14 : 26}
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
