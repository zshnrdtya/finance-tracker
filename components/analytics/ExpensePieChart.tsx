'use client';

import React, { useState } from 'react';
import { Card, CardTitle } from '@/components/ui/Card';
import { CategoryExpenseBreakdown } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { EmptyState } from '@/components/ui/EmptyState';
import { PieChart as PieChartIcon } from 'lucide-react';

interface ExpensePieChartProps {
  data: CategoryExpenseBreakdown[];
  title?: string;
  type?: 'expense' | 'income';
}

export const ExpensePieChart: React.FC<ExpensePieChartProps> = ({
  data,
  title = 'Distribusi Pengeluaran per Kategori',
  type = 'expense',
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const totalAmount = data.reduce((acc, curr) => acc + curr.total, 0);
  const activeItem = activeIndex !== null && data[activeIndex] ? data[activeIndex] : null;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as CategoryExpenseBreakdown;
      return (
        <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl shadow-gray-900/10 border border-gray-100 text-xs min-w-[170px] animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-2 font-bold text-gray-900 mb-1.5 pb-1.5 border-b border-gray-100">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
              style={{ backgroundColor: item.color }}
            />
            <span className="truncate">{item.name}</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-500 font-medium">Nominal:</span>
              <span className="font-bold text-gray-900">{formatCurrency(item.total)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-500 font-medium">Porsi:</span>
              <span className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[11px]">
                {item.percentage}%
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 pt-1 text-[11px] text-gray-400">
              <span>Frekuensi:</span>
              <span>{item.count} transaksi</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card padding="none" className="overflow-hidden border border-gray-200/80 shadow-xs bg-white">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
            Total {type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}:{' '}
            <strong className="text-gray-900 font-bold">{formatCurrency(totalAmount)}</strong>
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-6">
        {data.length === 0 || totalAmount === 0 ? (
          <EmptyState
            icon={PieChartIcon}
            title={`Belum ada data ${type === 'expense' ? 'pengeluaran' : 'pemasukan'}`}
            description={`Catat transaksi ${type === 'expense' ? 'pengeluaran' : 'pemasukan'} Anda untuk melihat proporsi kategori visual.`}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Donut Chart with Interactive Center Hub */}
            <div className="md:col-span-6 w-full flex items-center justify-center">
              <div className="relative w-full max-w-[260px] h-[240px] sm:h-[260px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={88}
                      paddingAngle={4}
                      cornerRadius={6}
                      dataKey="total"
                      onMouseEnter={(_, index) => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(null)}
                    >
                      {data.map((entry, index) => {
                        const isHovered = activeIndex === index;
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color || '#3B82F6'}
                            stroke="#ffffff"
                            strokeWidth={isHovered ? 3 : 2}
                            className="transition-all duration-200 cursor-pointer"
                            style={{
                              filter: isHovered
                                ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))'
                                : 'none',
                              opacity: activeIndex === null || isHovered ? 1 : 0.45,
                            }}
                          />
                        );
                      })}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Hub Indicator */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                  {activeItem ? (
                    <div className="animate-in fade-in zoom-in-90 duration-150 max-w-[130px]">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider block truncate"
                        style={{ color: activeItem.color }}
                      >
                        {activeItem.name}
                      </span>
                      <span className="text-sm sm:text-base font-extrabold text-gray-900 block truncate mt-0.5">
                        {formatCurrency(activeItem.total)}
                      </span>
                      <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        {activeItem.percentage}%
                      </span>
                    </div>
                  ) : (
                    <div className="animate-in fade-in duration-150 max-w-[130px]">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                        Total {type === 'expense' ? 'Keluar' : 'Masuk'}
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold text-gray-900 block truncate mt-0.5">
                        {formatCurrency(totalAmount)}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium block mt-0.5">
                        {data.length} Kategori
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Synchronized Category Legend List */}
            <div className="md:col-span-6 space-y-2 max-h-64 sm:max-h-72 overflow-y-auto pr-1">
              {data.map((cat, index) => {
                const isHovered = activeIndex === index;
                return (
                  <div
                    key={cat.id}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                    className={cn(
                      'p-2.5 rounded-xl border transition-all cursor-pointer text-xs',
                      isHovered
                        ? 'bg-gray-50/90 border-gray-200 shadow-xs scale-[1.01]'
                        : activeIndex !== null
                        ? 'border-transparent opacity-50'
                        : 'border-transparent hover:bg-gray-50/70'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-semibold text-gray-800 truncate" title={cat.name}>
                          {cat.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-gray-900">{formatCurrency(cat.total)}</span>
                        <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md min-w-[36px] text-center">
                          {cat.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Category mini progress bar */}
                    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: cat.color || '#3B82F6',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
