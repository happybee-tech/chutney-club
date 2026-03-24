'use client';

import Image from 'next/image';
import Link from 'next/link';
import { COLORS } from '@/lib/constants';

type AuthPageShellProps = {
  children: React.ReactNode;
  showTopBar?: boolean;
};

export function AuthPageShell({ children, showTopBar = true }: AuthPageShellProps) {
  return (
    <main style={{ backgroundColor: COLORS.mainBackground }}>
      {showTopBar && (
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6">
          <Link href="/" className="inline-flex items-center">
            <Image src="/chutney-club-logo.png" alt="Chutney Club" width={132} height={66} priority />
          </Link>
          <Link href="/" className="text-sm font-medium" style={{ color: COLORS.bodyText }}>
            Back to home
          </Link>
        </div>
      )}

      {children}
    </main>
  );
}
