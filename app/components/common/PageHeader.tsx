'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  backHref: string;
  actionButton?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, backHref, actionButton }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <Link href={backHref} className="inline-flex items-center gap-2 text-purple-200 hover:text-white transition-colors mb-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Powrót do dashboard
        </Link>
        <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
        <p className="text-purple-200">{subtitle}</p>
      </div>
      {actionButton}
    </motion.div>
  );
}

