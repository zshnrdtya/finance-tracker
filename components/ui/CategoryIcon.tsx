import React from 'react';
import {
  Briefcase,
  HeartHandshake,
  Laptop,
  TrendingUp,
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Film,
  Activity,
  GraduationCap,
  Home,
  Gift,
  Smartphone,
  Coffee,
  DollarSign,
  CreditCard,
  HelpCircle,
  Tag,
  ArrowUpRight,
  ArrowDownLeft,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  Briefcase,
  HeartHandshake,
  Laptop,
  TrendingUp,
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Film,
  Activity,
  GraduationCap,
  Home,
  Gift,
  Smartphone,
  Coffee,
  DollarSign,
  CreditCard,
  HelpCircle,
  Tag,
};

export interface CategoryIconProps {
  iconName?: string;
  type?: 'income' | 'expense';
  color?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  iconName,
  type,
  color,
  className,
  size = 'md',
}) => {
  let IconComponent = iconName ? iconMap[iconName] : null;

  if (!IconComponent) {
    if (type === 'income') {
      IconComponent = ArrowUpRight;
    } else if (type === 'expense') {
      IconComponent = ArrowDownLeft;
    } else {
      IconComponent = Tag;
    }
  }

  const sizeClasses = {
    sm: 'w-7 h-7 p-1.5 rounded-lg',
    md: 'w-10 h-10 p-2.5 rounded-xl',
    lg: 'w-12 h-12 p-3 rounded-2xl',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const dynamicBgColor = color ? `${color}15` : undefined;
  const dynamicTextColor = color || '#3B82F6';

  return (
    <div
      className={cn('inline-flex items-center justify-center shrink-0 transition-transform', sizeClasses[size], className)}
      style={{
        backgroundColor: dynamicBgColor || (type === 'income' ? '#ECFDF5' : '#FEF2F2'),
        color: dynamicTextColor || (type === 'income' ? '#10B981' : '#EF4444'),
      }}
    >
      <IconComponent className={iconSizes[size]} />
    </div>
  );
};
