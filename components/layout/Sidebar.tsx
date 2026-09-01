'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ReceiptText,
  PieChart,
  FolderKanban,
  LogOut,
  PlusCircle,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

interface SidebarProps {
  userEmail?: string;
  userName?: string;
  onOpenAddModal?: () => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  userEmail,
  userName,
  onOpenAddModal,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/dashboard',
    },
    {
      label: 'Transaksi',
      href: '/dashboard/transactions',
      icon: ReceiptText,
      active: pathname.startsWith('/dashboard/transactions'),
    },
    {
      label: 'Laporan & Analisis',
      href: '/dashboard/analytics',
      icon: PieChart,
      active: pathname.startsWith('/dashboard/analytics'),
    },
    {
      label: 'Kategori',
      href: '/dashboard/categories',
      icon: FolderKanban,
      active: pathname.startsWith('/dashboard/categories'),
    },
  ];

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full select-none">
      {/* Brand Logo */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3" onClick={onCloseMobile}>
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0 shadow-sm border border-gray-100 bg-white">
            <Image
              src="/asset/logo zz.png"
              alt="FinanceTrack Logo"
              width={40}
              height={40}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-gray-900">
              Finance<span className="text-blue-600">Track</span>
            </span>
            <p className="text-[11px] font-medium text-gray-400">Pribadi & Keluarga</p>
          </div>
        </Link>
      </div>

      {/* Quick Add Action */}
      {onOpenAddModal && (
        <div className="px-4 pt-5 pb-2">
          <Button
            onClick={() => {
              onOpenAddModal();
              onCloseMobile?.();
            }}
            variant="primary"
            size="md"
            className="w-full shadow-sm shadow-blue-600/20 hover:shadow-md hover:shadow-blue-600/30 font-semibold"
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Transaksi Baru
          </Button>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                item.active
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon
                className={cn('w-5 h-5 transition-colors', item.active ? 'text-blue-600' : 'text-gray-400')}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Sign Out Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-semibold text-sm shrink-0">
            {userName ? userName.charAt(0).toUpperCase() : <User className="w-4 h-4 text-blue-600" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">
              {userName || 'Akun Pribadi'}
            </p>
            <p className="text-[11px] text-gray-500 truncate" title={userEmail}>
              {userEmail || 'user@example.com'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-100"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Akun</span>
        </button>

        <p className="mt-3 text-[10px] text-center text-gray-400 font-medium">
          Dibuat oleh <span className="text-gray-600 font-semibold">Raditya Rai Zeeshan</span>
        </p>
      </div>
    </aside>
  );
};
