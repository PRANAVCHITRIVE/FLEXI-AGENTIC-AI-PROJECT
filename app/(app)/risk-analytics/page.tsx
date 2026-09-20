'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScoreGauge } from '@/components/score-gauge';
import { SectionCard, MetricCard } from '@/components/metric-card';
import { RiskBadge } from '@/components/score-badges';
import { loadAnalyses } from '@/lib/storage';
import { AnalysisResult } from '@/lib/types';
import { formatINR } from '@/lib/scoring';
import { cn } from '@/lib/utils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

function statusColor(status: string) {
  return status === 'Low' ? 'text-green-600' : status === 'Medium' ? 'text-amber-600' : 'text-red-600';
}
function barColor(status: string) {
  return status === 'Low' ? 'bg-green-500' : status === 'Medium' ? 'bg-amber-500' : 'bg-red-500';
}

export default function RiskAnalyticsPage() {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [selected, setSelected] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const all = loadAnalyses();
    setAnalyses(all);
    setSelected(all[0] ?? null);
  }, []);

  const a = selected;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Financial Risk Analytics</h2>
          <p className="text-sm text-muted-foreground">Multi-factor risk assessment and affordability analysis</p>
        </div>
        {analyses.length > 0 && (
          <select
            value={a?.id ?? ''}
            onChange={(e) => setSelected(analyses.find((x) => x.id === e.target.value) ?? null)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {analyses.map((an) => (
              <option key={an.id} value={an.id}>{an.applicant.fullName}</option>
            ))}
          </select>
        )}
      </div>

      {!a ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ShieldAlert className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-medium">No analyses available</p>
            <p className="mt-1 text-sm text-muted-foreground">Run a new analysis to view risk analytics.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overall risk */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardContent className="flex flex-col items-center p-6">
                <h3 className="text-sm font-semibold text-muted-foreground">Overall Risk Score</h3>
                <div className="mt-4">
                  <ScoreGauge
                    score={a.riskScore}
                    size={180}
                    color={a.riskScore <= 30 ? '#16a34a' : a.riskScore <= 60 ? '#d97706' : '#dc2626'}
                    label={a.riskTier}
                  />
                </div>
                <div className="mt-4"><RiskBadge tier={a.riskTier} /></div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Risk Breakdown</CardTitle>
                <CardDescription>Individual risk dimensions with status and explanation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {a.riskFactors.map((rf) => (
                  <div key={rf.key} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{rf.label}</span>
                      <div className="flex items-center gap-2">
                        <span className={cn('text-xs font-semibold', statusColor(rf.status))}>{rf.status}</span>
                        <span className="text-sm font-bold">{rf.score}/100</span>
                      </div>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className={cn('h-full rounded-full transition-all duration-1000', barColor(rf.status))} style={{ width: `${rf.score}%` }} />
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">{rf.explanation}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Affordability */}
          <SectionCard title="Affordability Analysis" description="Monthly income allocation and disposable income">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="grid grid-cols-2 gap-3">
                <MetricCard icon={Activity} label="Monthly Income" value={formatINR(a.applicant.monthlyIncome + a.applicant.otherMonthlyIncome)} iconClass="bg-primary/10" />
                <MetricCard icon={Activity} label="Household Expenses" value={formatINR(a.applicant.monthlyExpenses)} iconClass="bg-amber-500/10" />
                <MetricCard icon={Activity} label="Existing EMI" value={formatINR(a.applicant.existingMonthlyEmi)} iconClass="bg-amber-500/10" />
                <MetricCard icon={Activity} label="Disposable Income" value={formatINR(a.disposableIncome)} iconClass={a.disposableIncome >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'} />
                <MetricCard icon={Activity} label="Proposed EMI" value={formatINR(a.proposedEmi)} iconClass="bg-primary/10" />
                <MetricCard icon={Activity} label="Affordability" value={a.affordabilityStatus} iconClass={a.affordabilityStatus === 'Affordable' ? 'bg-green-500/10' : a.affordabilityStatus === 'Needs Review' ? 'bg-amber-500/10' : 'bg-red-500/10'} />
              </div>
              <div>
                <h4 className="mb-3 text-sm font-medium">Affordability Ratio</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Proposed EMI / Disposable Income</span>
                    <span className="font-semibold">{a.affordabilityRatio.toFixed(0)}%</span>
                  </div>
                  <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn('h-full rounded-full transition-all duration-1000',
                        a.affordabilityStatus === 'Affordable' ? 'bg-green-500' :
                        a.affordabilityStatus === 'Needs Review' ? 'bg-amber-500' : 'bg-red-500')}
                      style={{ width: `${Math.min(100, a.affordabilityRatio)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>0%</span><span>30% Safe</span><span>50% Review</span><span>100%+</span>
                  </div>
                </div>
                <div className={cn('mt-4 rounded-lg border p-3 text-sm',
                  a.affordabilityStatus === 'Affordable' ? 'border-green-200 bg-green-50 text-green-700' :
                  a.affordabilityStatus === 'Needs Review' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                  'border-red-200 bg-red-50 text-red-700')}>
                  {a.affordabilityStatus === 'Affordable'
                    ? 'The proposed EMI is well within disposable income. Loan is affordable.'
                    : a.affordabilityStatus === 'Needs Review'
                    ? 'Proposed EMI consumes a significant portion of disposable income. Review recommended.'
                    : 'Proposed EMI exceeds disposable income. Loan is not affordable at current terms.'}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Financial health charts */}
          <SectionCard title="Financial Health Dashboard" description="Key financial ratios based on applicant data">
            <div className="grid gap-4 lg:grid-cols-2">
              <FinancialChart
                title="Income vs Expenses"
                data={[
                  { name: 'Income', value: a.applicant.monthlyIncome + a.applicant.otherMonthlyIncome, fill: 'hsl(217 91% 50%)' },
                  { name: 'Expenses', value: a.applicant.monthlyExpenses, fill: 'hsl(38 92% 50%)' },
                  { name: 'EMI', value: a.applicant.existingMonthlyEmi, fill: 'hsl(0 84% 60%)' },
                  { name: 'Savings', value: a.applicant.monthlySavings, fill: 'hsl(142 71% 45%)' },
                ]}
              />
              <FinancialChart
                title="Debt vs Income"
                data={[
                  { name: 'Monthly Income', value: a.applicant.monthlyIncome + a.applicant.otherMonthlyIncome, fill: 'hsl(217 91% 50%)' },
                  { name: 'Monthly Debt', value: a.totalMonthlyDebt, fill: 'hsl(0 84% 60%)' },
                  { name: 'Proposed EMI', value: a.proposedEmi, fill: 'hsl(38 92% 50%)' },
                ]}
              />
              <RatioCard label="Savings Rate" value={`${((a.applicant.monthlySavings / (a.applicant.monthlyIncome + a.applicant.otherMonthlyIncome)) * 100).toFixed(0)}%`} />
              <RatioCard label="EMI Burden" value={`${a.dti.toFixed(1)}%`} />
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
}

function FinancialChart({ title, data }: { title: string; data: { name: string; value: number; fill: string }[] }) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-medium text-muted-foreground">{title}</h4>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v) => formatINR(v, true)} tick={{ fontSize: 10 }} width={60} />
            <Tooltip formatter={(v: number) => formatINR(v)} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function RatioCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border p-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="mt-1 text-2xl font-bold text-foreground">{value}</span>
    </div>
  );
}
