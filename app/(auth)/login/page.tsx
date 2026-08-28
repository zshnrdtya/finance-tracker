import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Login - FinanceTrack',
  description: 'Sign in to your FinanceTrack account',
};

export default function LoginPage() {
  return <LoginForm />;
}
