'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SupabaseConfigBanner } from '@/components/ui/SupabaseConfigBanner';
import { TransactionFormModal } from '@/components/transactions/TransactionFormModal';
import { useFinance } from '@/lib/context/FinanceContext';
import { Loader2 } from 'lucide-react';

export const DashboardShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const {
    user,
    isLoading,
    categories,
    isAddTransactionOpen,
    openAddTransaction,
    closeAddTransaction,
    addTransaction,
    fetchData,
  } = useFinance();

  // Determine dynamic title and subtitle based on current route
  const getPageInfo = () => {
    if (pathname === '/dashboard' || pathname === '/') {
      return {
        title: 'Financial Overview',
        subtitle: 'Track your personal and family income, spending, and savings',
      };
    }
    if (pathname.includes('/transactions')) {
      return {
        title: 'Transactions History',
        subtitle: 'View, search, and manage all your income and expense records',
      };
    }
    if (pathname.includes('/analytics')) {
      return {
        title: 'Reports & Analytics',
        subtitle: 'Visual category breakdown and multi-month financial insights',
      };
    }
    if (pathname.includes('/categories')) {
      return {
        title: 'Categories & Settings',
        subtitle: 'Organize your income and expense categorization schema',
      };
    }
    return { title: 'Finance Tracker', subtitle: 'Personal Finance Dashboard' };
  };

  const pageInfo = getPageInfo();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SupabaseConfigBanner />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0">
          <Sidebar
            userEmail={user?.email}
            userName={user?.user_metadata?.full_name}
            onOpenAddModal={openAddTransaction}
          />
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Sidebar drawer */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-10 animate-in slide-in-from-left duration-200">
              <Sidebar
                userEmail={user?.email}
                userName={user?.user_metadata?.full_name}
                onOpenAddModal={openAddTransaction}
                onCloseMobile={() => setIsMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <Header
            title={pageInfo.title}
            subtitle={pageInfo.subtitle}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            onOpenAddModal={openAddTransaction}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                <p className="text-sm font-medium">Loading your financial data...</p>
              </div>
            ) : (
              children
            )}
          </main>

          {/* Dashboard Footer */}
          <footer className="py-6 px-4 sm:px-8 border-t border-gray-200/80 text-center text-xs text-gray-500 bg-white/50">
            &copy; {new Date().getFullYear()} FinanceTrack &bull; Dibuat oleh <span className="font-semibold text-gray-700">Raditya Rai Zeeshan</span>
          </footer>
        </div>
      </div>

      {/* Global Quick Add Transaction Modal */}
      {user && (
        <TransactionFormModal
          isOpen={isAddTransactionOpen}
          onClose={closeAddTransaction}
          onSuccess={fetchData}
          categories={categories}
          userId={user.id}
          onSave={addTransaction}
        />
      )}
    </div>
  );
};
