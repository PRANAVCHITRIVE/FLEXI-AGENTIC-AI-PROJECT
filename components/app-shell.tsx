'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  FilePlus2,
  History,
  Calculator,
  ShieldAlert,
  Info,
  Search,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/new-analysis', label: 'New Analysis', icon: FilePlus2 },
  { href: '/history', label: 'Analysis History', icon: History },
  { href: '/emi-calculator', label: 'EMI Calculator', icon: Calculator },
  { href: '/risk-analytics', label: 'Risk Analytics', icon: ShieldAlert },
  { href: '/about', label: 'About Project', icon: Info },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
              active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            <Icon
              className={cn(
                'h-4.5 w-4.5 shrink-0 transition-colors',
                active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
              )}
              style={{ width: 18, height: 18 }}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function AgentStatus() {
  return (
    <div className="mt-auto rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
        </span>
        <span className="text-sm font-medium text-foreground">AI Agent Online</span>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        Explainable decision engine ready
      </p>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const current = NAV_ITEMS.find((n) => n.href === pathname);
  const title = current?.label ?? 'LoanAI Agent';

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-card p-4 lg:flex">
        <Link href="/" className="flex items-center gap-2.5 px-2 py-2">
          <Logo />
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight text-foreground">
              LoanAI Agent
            </span>
            <span className="text-[11px] text-muted-foreground">Eligibility Intelligence</span>
          </div>
        </Link>
        <div className="mt-6 flex flex-1 flex-col">
          <NavList />
          <AgentStatus />
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md lg:px-6">
          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-4">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex items-center gap-2.5 px-2 py-2">
                <Logo />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold leading-tight">
                    LoanAI Agent
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Eligibility Intelligence
                  </span>
                </div>
              </div>
              <div className="mt-6 flex h-full flex-col">
                <NavList onNavigate={() => setMobileOpen(false)} />
                <AgentStatus />
              </div>
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold text-foreground">{title}</h1>
          </div>

          <div className="hidden items-center md:flex">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search analyses..."
                className="h-9 w-56 pl-9"
                onChange={() => {}}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 sm:flex">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-medium text-muted-foreground">AI Agent Active</span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              DA
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>

        <footer className="border-t px-4 py-3 text-center lg:px-6">
          <p className="text-xs text-muted-foreground">
            Academic demonstration only. This tool provides preliminary decision-support
            insights and does not represent an official lending decision.
          </p>
        </footer>
      </div>
    </div>
  );
}
