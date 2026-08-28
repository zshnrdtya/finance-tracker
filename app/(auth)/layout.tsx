import React from 'react';
import { WalletCards } from 'lucide-react';
import { SupabaseConfigBanner } from '@/components/ui/SupabaseConfigBanner';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 flex flex-col justify-between">
      <SupabaseConfigBanner />

      <header className="p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <WalletCards className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-gray-900">
                Finance<span className="text-blue-600">Track</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium border border-blue-200/60">
                Family & Personal
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-100/80">
          {children}
        </div>
      </main>

      <footer className="p-6 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} FinanceTrack &bull; Dibuat oleh <span className="font-semibold text-gray-700">Raditya Rai Zeeshan</span>
      </footer>
    </div>
  );
}
