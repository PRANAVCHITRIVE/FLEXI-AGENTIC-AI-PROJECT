'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  FileText,
  BarChart3,
  Calculator,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScoreGauge } from '@/components/score-gauge';
import { MetricCard, SectionCard } from '@/components/metric-card';
import { EligibilityBadge, RiskBadge } from '@/components/score-badges';
import { getAnalysis } from '@/lib/storage';
import { AnalysisResult, FactorScore } from '@/lib/types';
import { formatINR } from '@/lib/scoring';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

function impactColor(impact: FactorScore['impact']) {
  switch (impact) {
    case 'High Positive': return 'bg-green-500';
    case 'Positive': return 'bg-green-400';
    case 'Moderate': return 'bg-amber-400';
    case 'Negative': return 'bg-red-400';
    case 'High Negative': return 'bg-red-500';
  }
}

function FactorBar({ factor }: { factor: FactorScore }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{factor.label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{factor.description}</p>
        </div>
        <span className={cn(
          'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
          factor.impact.includes('Positive') ? 'bg-green-50 text-green-700' :
          factor.impact === 'Moderate' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
        )}>
          {factor.impact}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className={cn('h-full rounded-full transition-all duration-1000', impactColor(factor.impact))}
            style={{ width: `${factor.score}%` }}
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground">{factor.score}/100</span>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        Weight: {(factor.weight * 100).toFixed(0)}% · Contribution: {factor.weightedContribution.toFixed(1)}
      </p>
    </div>
  );
}

export default function AnalysisResultPage() {
  return (
    <Suspense fallback={<div className="flex h-40 items-center justify-center text-muted-foreground">Loading analysis...</div>}>
      <AnalysisResultContent />
    </Suspense>
  );
}

function AnalysisResultContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const id = params.id as string;
    const r = getAnalysis(id);
    if (!r) {
      router.push('/history');
      return;
    }
    setResult(r);
    if (searchParams.get('new')) {
      toast({ title: 'Analysis complete', description: `${r.applicant.fullName} — ${r.eligibilityTier}` });
    }
  }, [params.id, router, searchParams, toast]);

  if (!result) {
    return <div className="flex h-40 items-center justify-center text-muted-foreground">Loading analysis...</div>;
  }

  const a = result;
  const recommendedLow = Math.round(a.recommendedLoanAmount * 0.95);
  const recommendedHigh = Math.round(a.recommendedLoanAmount * 1.05);

  const factorChartData = a.factors.map((f) => ({
    name: f.label.split(' ')[0],
    score: f.score,
    fill: f.score >= 75 ? '#16a34a' : f.score >= 55 ? '#d97706' : '#dc2626',
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/history">
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-1 h-4 w-4" /> Back to History</Button>
        </Link>
        <div className="flex gap-2">
          <Link href={`/analysis/${a.id}/report`}>
            <Button variant="outline" size="sm"><FileText className="mr-1 h-4 w-4" /> View Report</Button>
          </Link>
          <Link href="/new-analysis">
            <Button size="sm"><Sparkles className="mr-1 h-4 w-4" /> New Analysis</Button>
          </Link>
        </div>
      </div>

      {/* Result hero */}
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center gap-6 p-8 lg:flex-row lg:justify-around">
          <div className="flex flex-col items-center">
            <ScoreGauge
              score={a.eligibilityScore}
              size={200}
              label={a.eligibilityTier}
              sublabel="Eligibility Score"
            />
            <div className="mt-4 flex items-center gap-2">
              <EligibilityBadge tier={a.eligibilityTier} />
              <RiskBadge tier={a.riskTier} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <MetricCard icon={ShieldCheck} label="Eligibility Score" value={`${a.eligibilityScore}/100`} iconClass="bg-primary/10" />
            <MetricCard icon={AlertTriangle} label="Risk Score" value={`${a.riskScore}/100`} iconClass="bg-amber-500/10" />
            <MetricCard icon={CheckCircle2} label="Credit Score" value={`${a.applicant.creditScore}/900`} iconClass="bg-green-500/10" />
            <MetricCard icon={BarChart3} label="DTI" value={`${a.dti.toFixed(1)}%`} iconClass="bg-accent/10" />
            <MetricCard icon={Calculator} label="Monthly EMI" value={formatINR(a.proposedEmi)} iconClass="bg-primary/10" />
            <MetricCard icon={TrendingUp} label="Recommended Loan" value={`${formatINR(recommendedLow, true)}–${formatINR(recommendedHigh, true)}`} iconClass="bg-green-500/10" />
          </div>
        </CardContent>
      </Card>

      {/* Explainable AI */}
      <SectionCard
        title="Why did the AI Agent make this decision?"
        description="Measurable decision factors with weighted contributions to the final eligibility score."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <h4 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-green-700">
              <CheckCircle2 className="h-4 w-4" /> Positive Factors
            </h4>
            <div className="space-y-3">
              {a.positiveFactors.length === 0 && <p className="text-sm text-muted-foreground">No strong positive factors identified.</p>}
              {a.positiveFactors.map((f) => <FactorBar key={f.key} factor={f} />)}
            </div>
          </div>
          <div>
            <h4 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-amber-700">
              <AlertTriangle className="h-4 w-4" /> Risk Factors
            </h4>
            <div className="space-y-3">
              {a.riskFlagFactors.length === 0 && <p className="text-sm text-muted-foreground">No significant risk factors detected.</p>}
              {a.riskFlagFactors.map((f) => <FactorBar key={f.key} factor={f} />)}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Factor chart */}
      <SectionCard title="Factor Score Breakdown" description="Individual factor scores contributing to eligibility">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={factorChartData} margin={{ left: 0, right: 16, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {factorChartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      {/* Recommendation */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" /> AI Agent Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed text-foreground">{a.recommendation}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-card p-3">
              <p className="text-xs text-muted-foreground">Recommended Loan Amount</p>
              <p className="mt-1 text-base font-bold">{formatINR(a.recommendedLoanAmount)}</p>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <p className="text-xs text-muted-foreground">Recommended Tenure</p>
              <p className="mt-1 text-base font-bold">{a.recommendedTenureMonths} months</p>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <p className="text-xs text-muted-foreground">Estimated Interest Rate</p>
              <p className="mt-1 text-base font-bold">{a.estimatedInterestRate}%</p>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <p className="text-xs text-muted-foreground">Estimated EMI</p>
              <p className="mt-1 text-base font-bold">{formatINR(a.estimatedEmi)}/mo</p>
            </div>
          </div>
          <div>
            <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <Lightbulb className="h-4 w-4 text-amber-500" /> How to improve eligibility
            </h4>
            <ul className="space-y-1.5">
              {a.improvements.map((imp, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {imp}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="flex flex-wrap gap-2">
        <Link href={`/analysis/${a.id}/report`}><Button variant="outline"><FileText className="mr-1 h-4 w-4" /> Full Report</Button></Link>
        <Link href="/risk-analytics"><Button variant="outline"><BarChart3 className="mr-1 h-4 w-4" /> Risk Analytics</Button></Link>
        <Link href="/emi-calculator"><Button variant="outline"><Calculator className="mr-1 h-4 w-4" /> EMI Calculator</Button></Link>
      </div>
    </div>
  );
}
