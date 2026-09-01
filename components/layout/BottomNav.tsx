'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ReceiptText,
  PieChart,
  FolderKanban,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  onOpenAddModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenAddModal }) => {
  const pathname = usePathname();

  const isDashboard = pathname === '/dashboard' || pathname === '/';
  const isTransactions = pathname.startsWith('/dashboard/transactions');
  const isAnalytics = pathname.startsWith('/dashboard/analytics');
  const isCategories = pathname.startsWith('/dashboard/categories');

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom,0px)]"
      aria-label="Navigasi Bawah Mobile"
    >
      <div className="max-w-md mx-auto px-3 py-1.5 flex items-center justify-around">
        {/* 1. Dashboard */}
        <Link
          href="/dashboard"
          className={cn(
            'flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150',
            isDashboard
              ? 'text-blue-600 font-bold scale-105'
              : 'text-gray-500 hover:text-gray-800'
          )}
        >
          <LayoutDashboard className={cn('w-5 h-5 mb-0.5', isDashboard ? 'stroke-[2.5]' : 'stroke-2')} />
          <span className="text-[10px] tracking-tight">Dashboard</span>
        </Link>

        {/* 2. Transaksi */}
        <Link
          href="/dashboard/transactions"
          className={cn(
            'flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150',
            isTransactions
              ? 'text-blue-600 font-bold scale-105'
              : 'text-gray-500 hover:text-gray-800'
          )}
        >
          <ReceiptText className={cn('w-5 h-5 mb-0.5', isTransactions ? 'stroke-[2.5]' : 'stroke-2')} />
          <span className="text-[10px] tracking-tight">Transaksi</span>
        </Link>

        {/* 3. Center Floating Action Add Button */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex flex-col items-center justify-center -mt-5 group cursor-pointer"
          aria-label="Catat Transaksi Baru"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/35 border-2 border-white group-active:scale-95 transition-transform">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-semibold text-blue-600 mt-0.5">Catat</span>
        </button>

        {/* 4. Laporan / Analisis */}
        <Link
          href="/dashboard/analytics"
          className={cn(
            'flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150',
            isAnalytics
              ? 'text-blue-600 font-bold scale-105'
              : 'text-gray-500 hover:text-gray-800'
          )}
        >
          <PieChart className={cn('w-5 h-5 mb-0.5', isAnalytics ? 'stroke-[2.5]' : 'stroke-2')} />
          <span className="text-[10px] tracking-tight">Laporan</span>
        </Link>

        {/* 5. Kategori */}
        <Link
          href="/dashboard/categories"
          className={cn(
            'flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150',
            isCategories
              ? 'text-blue-600 font-bold scale-105'
              : 'text-gray-500 hover:text-gray-800'
          )}
        >
          <FolderKanban className={cn('w-5 h-5 mb-0.5', isCategories ? 'stroke-[2.5]' : 'stroke-2')} />
          <span className="text-[10px] tracking-tight">Kategori</span>
        </Link>
      </div>
    </nav>
  );
};
