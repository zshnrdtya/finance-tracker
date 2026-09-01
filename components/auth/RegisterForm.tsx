'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AlertNotification } from '@/components/ui/Toast';
import { Mail, Lock, User, UserPlus, ArrowRight } from 'lucide-react';
import { DEFAULT_INCOME_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES } from '@/lib/constants';

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password || !fullName) {
      setErrorMessage('Silakan lengkapi seluruh data yang diminta.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Kata sandi minimal harus terdiri dari 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      const user = data.user;
      if (user) {
        // Fallback category seed: If SQL trigger didn't run, ensure user has default categories
        try {
          const { data: existingCategories } = await supabase
            .from('categories')
            .select('id')
            .eq('user_id', user.id)
            .limit(1);

          if (!existingCategories || existingCategories.length === 0) {
            const categoriesToInsert = [
              ...DEFAULT_INCOME_CATEGORIES.map((c) => ({
                user_id: user.id,
                name: c.name,
                type: 'income',
                color: c.color,
                icon: c.icon,
              })),
              ...DEFAULT_EXPENSE_CATEGORIES.map((c) => ({
                user_id: user.id,
                name: c.name,
                type: 'expense',
                color: c.color,
                icon: c.icon,
              })),
            ];
            await supabase.from('categories').insert(categoriesToInsert);
          }
        } catch {
          // Non-blocking fallback
        }
      }

      if (data.session) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setSuccessMessage(
          'Pendaftaran berhasil! Silakan periksa kotak masuk email Anda untuk verifikasi atau langsung login.'
        );
        setIsLoading(false);
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Terjadi kesalahan tak terduga saat pendaftaran.'
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20 mb-2">
          <UserPlus className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
          Buat Akun Baru
        </h1>
        <p className="text-sm text-gray-500">
          Mulai atur dan catat keuangan pribadi & keluarga Anda dengan mudah
        </p>
      </div>

      {errorMessage && (
        <AlertNotification
          type="error"
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      {successMessage && (
        <AlertNotification
          type="success"
          title="Akun Berhasil Dibuat"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nama Lengkap"
          type="text"
          name="name"
          autoComplete="name"
          placeholder="Contoh: Raditya Pratama"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          leftIcon={<User className="w-4 h-4 text-gray-400" />}
          required
        />

        <Input
          label="Alamat Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="nama@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
          required
        />

        <Input
          label="Kata Sandi"
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="Minimal 6 karakter"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
          required
        />

        <Input
          label="Konfirmasi Kata Sandi"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Ulangi kata sandi Anda"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2 font-semibold"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Daftar Akun
        </Button>
      </form>

      <div className="text-center text-sm text-gray-500 pt-2 border-t border-gray-100">
        Sudah memiliki akun?{' '}
        <Link
          href="/login"
          className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Masuk di sini
        </Link>
      </div>
    </div>
  );
};
