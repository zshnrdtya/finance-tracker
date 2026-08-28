import React from 'react';
import { FinanceProvider } from '@/lib/context/FinanceContext';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <FinanceProvider>
      <DashboardShell>{children}</DashboardShell>
    </FinanceProvider>
  );
}
