'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FilePlus2,
  Users,
  Percent,
  Activity,
  Timer,
  ArrowRight,
  UserCheck,
  ShieldCheck,
  BarChart3,
  Brain,
  CheckCircle2,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { KpiCard } from '@/components/kpi-card';
import { SectionCard } from '@/components/metric-card';
import { EligibilityBadge, RiskBadge } from '@/components/score-badges';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { loadAnalyses } from '@/lib/storage';
import { AnalysisResult } from '@/lib/types';
import { formatINR } from '@/lib/scoring';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

const WORKFLOW_STEPS = [
  { num: 1, label: 'Applicant Data', icon: Users, desc: 'Collect financial profile' },
  { num: 2, label: 'Data Validation', icon: CheckCircle2, desc: 'Verify inputs & ranges' },
  { num: 3, label: 'Financial Analysis', icon: BarChart3, desc: 'Income & expense breakdown' },
  { num: 4, label: 'Credit Assessment', icon: ShieldCheck, desc: 'Score & history review' },
  { num: 5, label: 'Risk Evaluation', icon: Activity, desc: 'Multi-factor risk scoring' },
  { num: 6, label: 'Eligibility Prediction', icon: Brain, desc: 'Weighted scoring engine' },
  { num: 7, label: 'Recommendation', icon: TrendingUp, desc: 'Decision & guidance' },
];

export default function DashboardPage() {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    setAnalyses(loadAnalyses());
  }, []);

  const recent = analyses.slice(0, 5);

  const eligible = analyses.filter((a) => a.eligibilityTier === 'Eligible').length;
  const conditional = analyses.filter((a) => a.eligibilityTier === 'Conditionally Eligible').length;
  const notEligible = analyses.filter((a) => a.eligibilityTier === 'Not Eligible').length;

  const lowRisk = analyses.filter((a) => a.riskTier === 'Low Risk').length;
  const medRisk = analyses.filter((a) => a.riskTier === 'Medium Risk').length;
  const highRisk = analyses.filter((a) => a.riskTier === 'High Risk').length;

  const eligibilityData = [
    { name: 'Eligible', value: eligible, color: '#16a34a' },
    { name: 'Conditionally Eligible', value: conditional, color: '#d97706' },
    { name: 'Not Eligible', value: notEligible, color: '#dc2626' },
  ].filter((d) => d.value > 0);

  const riskData = [
    { name: 'Low Risk', count: lowRisk, fill: '#16a34a' },
    { name: 'Medium Risk', count: medRisk, fill: '#d97706' },
    { name: 'High Risk', count: highRisk, fill: '#dc2626' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">LoanAI Agent</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
              <Sparkles className="h-3 w-3" /> AI
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            AI-powered financial eligibility intelligence
          </p>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Evaluate applicant affordability, credit strength, debt obligations and
            repayment capacity through an explainable AI decision-support workflow.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/new-analysis">
            <Button>
              <FilePlus2 className="mr-2 h-4 w-4" /> New Loan Analysis
            </Button>
          </Link>
          <Link href="/new-analysis?demo=0">
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" /> Load Demo Applicant
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={Users}
          metric="128"
          label="Applications Analyzed"
          indicator={<Progress value={72} className="h-1.5" />}
        />
        <KpiCard
          icon={Percent}
          metric="76%"
          label="Average Eligibility"
          iconClass="bg-green-500/10"
          indicator={
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="h-3 w-3" /> Above target
            </div>
          }
        />
        <KpiCard
          icon={Activity}
          metric="31 / 100"
          label="Average Risk Score"
          iconClass="bg-amber-500/10"
          indicator={<Progress value={31} className="h-1.5" />}
        />
        <KpiCard
          icon={Timer}
          metric="< 5 sec"
          label="Average Analysis Time"
          iconClass="bg-accent/10"
          indicator={
            <div className="flex items-center gap-1 text-xs text-accent">
              <Sparkles className="h-3 w-3" /> Real-time engine
            </div>
          }
        />
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-base font-semibold text-foreground">How LoanAI Agent Works</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            A transparent seven-stage decision-support pipeline from applicant data to recommendation.
          </p>
          <div className="mt-6 flex flex-col gap-2 lg:flex-row lg:items-stretch">
            {WORKFLOW_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="flex flex-1 flex-col lg:flex-row">
                  <div className="group flex flex-1 flex-col items-center rounded-lg border bg-card p-4 text-center transition-all hover:border-primary/40 hover:shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="mt-2 text-[11px] font-semibold text-primary">
                      Step {step.num}
                    </span>
                    <span className="mt-0.5 text-sm font-medium text-foreground">
                      {step.label}
                    </span>
                    <span className="mt-1 text-xs text-muted-foreground">{step.desc}</span>
                  </div>
                  {i < WORKFLOW_STEPS.length - 1 && (
                    <div className="flex items-center justify-center px-1 py-2 lg:py-0">
                      <div className="h-6 w-px bg-border lg:h-px lg:w-full" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Eligibility Distribution" description="Outcomes across all analyses">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={eligibilityData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {eligibilityData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Risk Distribution" description="Risk tier breakdown">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData} margin={{ left: 0, right: 16, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">Recent Analyses</h3>
              <p className="text-sm text-muted-foreground">Latest 5 applicant assessments</p>
            </div>
            <Link href="/history">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Applicant</th>
                  <th className="pb-2 pr-4 font-medium">Loan Type</th>
                  <th className="pb-2 pr-4 font-medium">Amount</th>
                  <th className="pb-2 pr-4 font-medium">Credit</th>
                  <th className="pb-2 pr-4 font-medium">Risk</th>
                  <th className="pb-2 pr-4 font-medium">Eligibility</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No analyses yet. Run a new analysis to see results here.
                    </td>
                  </tr>
                )}
                {recent.map((a) => (
                  <tr key={a.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{a.applicant.fullName}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{a.applicant.loanType}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{formatINR(a.applicant.loanAmount, true)}</td>
                    <td className="py-3 pr-4">{a.applicant.creditScore}</td>
                    <td className="py-3 pr-4"><RiskBadge tier={a.riskTier} /></td>
                    <td className="py-3 pr-4"><EligibilityBadge tier={a.eligibilityTier} /></td>
                    <td className="py-3 text-xs text-muted-foreground">
                      {new Date(a.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
