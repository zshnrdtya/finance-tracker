'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { SupabaseConfigBanner } from '@/components/ui/SupabaseConfigBanner';

function AuthContent() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialMode);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 flex flex-col justify-between">
      <SupabaseConfigBanner />

      <header className="p-3.5 sm:p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5">
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
          </div>

          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('login')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Daftar
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-3.5 sm:p-6 my-auto">
        <div className="w-full max-w-md bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-100/80">
          {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
        </div>
      </main>

      <footer className="p-6 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} FinanceTrack &bull; Dibuat oleh{' '}
        <span className="font-semibold text-gray-700">Raditya Rai Zeeshan</span>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 text-sm">
          Memuat autentikasi...
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
