import { Suspense } from 'react';
import { SetPasswordForm } from '@/components/auth/SetPasswordForm';

export default function CompleteSignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[linear-gradient(180deg,#F5EBDD_0%,#F2E6D7_100%)]" />}>
      <SetPasswordForm forcedFlow="signup" />
    </Suspense>
  );
}
