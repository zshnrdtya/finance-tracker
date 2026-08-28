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
import { BarChart3 } from 'lucide-react';

interface MonthlyOverviewChartProps {
  data: MonthlyChartData[];
  onOpenAddModal: () => void;
}

export const MonthlyOverviewChart: React.FC<MonthlyOverviewChartProps> = ({
  data,
  onOpenAddModal,
}) => {
  const hasData = data.some((d) => d.income > 0 || d.expense > 0);

  const formatYAxis = (tickItem: number) => {
    if (tickItem >= 1000000) {
      return `${(tickItem / 1000000).toFixed(1)}M`;
    }
    if (tickItem >= 1000) {
      return `${(tickItem / 1000).toFixed(0)}k`;
    }
    return tickItem.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3.5 rounded-xl shadow-lg border border-gray-100 text-xs">
          <p className="font-bold text-gray-900 mb-2 border-b border-gray-100 pb-1">{label}</p>
          <div className="space-y-1">
            <p className="text-emerald-600 font-semibold flex items-center justify-between gap-4">
              <span>Income:</span>
              <span>{formatCurrency(payload[0]?.value || 0)}</span>
            </p>
            <p className="text-red-600 font-semibold flex items-center justify-between gap-4">
              <span>Expense:</span>
              <span>{formatCurrency(payload[1]?.value || 0)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <CardTitle>Cash Flow Overview</CardTitle>
          <p className="text-xs text-gray-500 mt-0.5">Income vs Expense trends over recent months</p>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {!hasData ? (
          <EmptyState
            icon={BarChart3}
            title="No cash flow data yet"
            description="Add your monthly income and expenses to generate visual analytics."
            actionLabel="Add Transaction"
            onAction={onOpenAddModal}
          />
        ) : (
          <div className="h-64 sm:h-72 w-full">
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
                  wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
                />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
                <Bar
                  dataKey="expense"
                  name="Expense"
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  );
};
