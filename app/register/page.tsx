'use client';

import React from 'react';
import Image from 'next/image';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { SupabaseConfigBanner } from '@/components/ui/SupabaseConfigBanner';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 flex flex-col justify-between">
      <SupabaseConfigBanner />

      <header className="p-3.5 sm:p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0 shadow-sm border border-gray-100 bg-white">
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
              <span className="text-lg sm:text-xl font-bold tracking-tight text-gray-900">
                Finance<span className="text-blue-600">Track</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-semibold border border-blue-200/60">
                Pribadi & Keluarga
              </span>
            </div>
          </Link>

          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-xs transition-colors"
          >
            Masuk
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-3.5 sm:p-6 my-auto">
        <div className="w-full max-w-md bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-100/80">
          <RegisterForm />
        </div>
      </main>

      <footer className="p-6 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} FinanceTrack &bull; Dibuat oleh{' '}
        <span className="font-semibold text-gray-700">Raditya Rai Zeeshan</span>
      </footer>
    </div>
  );
}
