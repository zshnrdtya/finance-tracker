'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { CategoryExpenseBreakdown } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
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
  title = 'Expense Breakdown by Category',
  type = 'expense',
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const totalAmount = data.reduce((acc, curr) => acc + curr.total, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as CategoryExpenseBreakdown;
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 text-xs">
          <div className="flex items-center gap-2 font-bold text-gray-900 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span>{item.name}</span>
          </div>
          <p className="text-gray-600 font-semibold">{formatCurrency(item.total)}</p>
          <p className="text-gray-400 mt-0.5">
            {item.percentage}% of total {type} ({item.count} transactions)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="text-xs text-gray-500 mt-0.5">
            Total {type === 'expense' ? 'Spending' : 'Earnings'}:{' '}
            <strong className="text-gray-900">{formatCurrency(totalAmount)}</strong>
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {data.length === 0 || totalAmount === 0 ? (
          <EmptyState
            icon={PieChartIcon}
            title={`No ${type} data available`}
            description={`Log your ${type} transactions to view category distribution.`}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Pie Chart Canvas */}
            <div className="h-64 md:col-span-7 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="total"
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || '#3B82F6'}
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Legend List with Percentage */}
            <div className="md:col-span-5 space-y-2 max-h-64 overflow-y-auto pr-2">
              {data.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-md shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-medium text-gray-800 truncate" title={cat.name}>
                      {cat.name}
                    </span>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="font-bold text-gray-900">{cat.percentage}%</span>
                    <span className="text-[11px] text-gray-400 block">
                      {formatCurrency(cat.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
