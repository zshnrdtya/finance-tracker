import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { CategoryExpenseBreakdown } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { EmptyState } from '@/components/ui/EmptyState';
import { Layers } from 'lucide-react';

interface CategoryBreakdownTableProps {
  data: CategoryExpenseBreakdown[];
  type?: 'expense' | 'income';
}

export const CategoryBreakdownTable: React.FC<CategoryBreakdownTableProps> = ({
  data,
  type = 'expense',
}) => {
  const total = data.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <CardTitle>
            {type === 'expense' ? 'Expense' : 'Income'} Category Rankings
          </CardTitle>
          <p className="text-xs text-gray-500 mt-0.5">
            Breakdown sorted by highest volume and percentage share
          </p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={Layers}
            title={`No ${type} categories recorded`}
            description="Start logging transactions to see detailed rankings."
          />
        </div>
      ) : (
        <div className="p-5 sm:p-6 space-y-4">
          {data.map((cat, index) => (
            <div key={cat.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2 font-medium text-gray-800">
                  <span className="text-gray-400 font-mono w-4">{index + 1}.</span>
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span>{cat.name}</span>
                  <span className="text-gray-400 text-xs hidden sm:inline">
                    ({cat.count} {cat.count === 1 ? 'record' : 'records'})
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900">{formatCurrency(cat.total)}</span>
                  <span className="text-xs font-semibold text-gray-500 w-10 text-right">
                    {cat.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: cat.color || '#3B82F6',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
