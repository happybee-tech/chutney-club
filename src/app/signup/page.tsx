import { Suspense } from 'react';
import { AuthCredentialsForm } from '@/components/auth/AuthCredentialsForm';

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[linear-gradient(180deg,#F5EBDD_0%,#F2E6D7_100%)]" />}>
      <AuthCredentialsForm mode="signup" />
    </Suspense>
  );
}
