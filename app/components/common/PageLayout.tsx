'use client';

import { ReactNode } from 'react';
import AnimatedBackground from '../AnimatedBackground';

interface PageLayoutProps {
  children: ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AnimatedBackground />
      <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}

