'use client';

import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn('h-8 w-8', className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="40" height="40" rx="10" fill="hsl(217 91% 50%)" />
      <path
        d="M20 8 L29 13 L29 21 C29 27 25 30 20 32 C15 30 11 27 11 21 L11 13 Z"
        fill="none"
        stroke="white"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M15 20 L18.5 23.5 L25 16.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="13" r="1.4" fill="hsl(199 89% 60%)" />
      <circle cx="27" cy="17" r="1.2" fill="hsl(199 89% 60%)" />
      <circle cx="13" cy="17" r="1.2" fill="hsl(199 89% 60%)" />
      <line x1="20" y1="13" x2="27" y2="17" stroke="hsl(199 89% 60%)" strokeWidth="0.8" opacity="0.6" />
      <line x1="20" y1="13" x2="13" y2="17" stroke="hsl(199 89% 60%)" strokeWidth="0.8" opacity="0.6" />
    </svg>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return <Logo className={className} />;
}
