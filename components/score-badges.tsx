'use client';

import { cn } from '@/lib/utils';
import { EligibilityTier, RiskTier } from '@/lib/types';

export function EligibilityBadge({ tier, className }: { tier: EligibilityTier; className?: string }) {
  const styles: Record<EligibilityTier, string> = {
    Eligible: 'bg-green-50 text-green-700 border-green-200',
    'Conditionally Eligible': 'bg-amber-50 text-amber-700 border-amber-200',
    'Not Eligible': 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        styles[tier],
        className
      )}
    >
      {tier}
    </span>
  );
}

export function RiskBadge({ tier, className }: { tier: RiskTier; className?: string }) {
  const styles: Record<RiskTier, string> = {
    'Low Risk': 'bg-green-50 text-green-700 border-green-200',
    'Medium Risk': 'bg-amber-50 text-amber-700 border-amber-200',
    'High Risk': 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        styles[tier],
        className
      )}
    >
      {tier}
    </span>
  );
}

export function ScoreBadge({ score, className }: { score: number; className?: string }) {
  const color =
    score >= 75 ? 'text-green-700' : score >= 55 ? 'text-amber-700' : 'text-red-700';
  return (
    <span className={cn('text-sm font-semibold', color, className)}>{score}/100</span>
  );
}
