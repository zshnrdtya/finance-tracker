import { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Register - FinanceTrack',
  description: 'Create a new FinanceTrack account for personal or family finance tracking',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
