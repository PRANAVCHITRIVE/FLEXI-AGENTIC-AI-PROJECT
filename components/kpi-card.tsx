'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export function KpiCard({
  icon: Icon,
  metric,
  label,
  indicator,
  iconClass,
}: {
  icon: LucideIcon;
  metric: string;
  label: string;
  indicator?: React.ReactNode;
  iconClass?: string;
}) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{metric}</p>
          </div>
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10',
              iconClass
            )}
          >
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        {indicator && <div className="mt-3">{indicator}</div>}
      </CardContent>
    </Card>
  );
}
