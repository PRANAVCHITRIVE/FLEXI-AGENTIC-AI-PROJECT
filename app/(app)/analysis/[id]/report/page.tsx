'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoreGauge } from '@/components/score-gauge';
import { EligibilityBadge, RiskBadge } from '@/components/score-badges';
import { getAnalysis } from '@/lib/storage';
import { AnalysisResult } from '@/lib/types';
import { formatINR } from '@/lib/scoring';

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const r = getAnalysis(params.id as string);
    if (!r) {
      router.push('/history');
      return;
    }
    setResult(r);
  }, [params.id, router]);

  if (!result) return <div className="flex h-40 items-center justify-center text-muted-foreground">Loading report...</div>;

  const a = result;

  const sections: { title: string; rows: { label: string; value: string }[] }[] = [
    {
      title: 'Applicant Profile',
      rows: [
        { label: 'Name', value: a.applicant.fullName },
        { label: 'Age', value: `${a.applicant.age} years` },
        { label: 'City', value: a.applicant.city },
        { label: 'Dependents', value: String(a.applicant.dependents) },
      ],
    },
    {
      title: 'Employment Details',
      rows: [
        { label: 'Employment Type', value: a.applicant.employmentType },
        { label: 'Monthly Income', value: formatINR(a.applicant.monthlyIncome) },
        { label: 'Other Income', value: formatINR(a.applicant.otherMonthlyIncome) },
        { label: 'Employment Duration', value: `${a.applicant.employmentDurationYears} years` },
      ],
    },
    {
      title: 'Credit Profile',
      rows: [
        { label: 'Credit Score', value: `${a.applicant.creditScore} / 900` },
        { label: 'Repayment History', value: a.applicant.repaymentHistory },
        { label: 'Existing Loan Balance', value: formatINR(a.applicant.existingLoanBalance) },
        { label: 'Existing Monthly EMI', value: formatINR(a.applicant.existingMonthlyEmi) },
        { label: 'Active Loans', value: String(a.applicant.activeLoans) },
      ],
    },
    {
      title: 'Loan Request',
      rows: [
        { label: 'Loan Type', value: a.applicant.loanType },
        { label: 'Requested Amount', value: formatINR(a.applicant.loanAmount) },
        { label: 'Tenure', value: `${a.applicant.loanTenureYears} years` },
        { label: 'Interest Rate', value: `${a.applicant.interestRate}%` },
      ],
    },
    {
      title: 'Income Analysis',
      rows: [
        { label: 'Total Monthly Income', value: formatINR(a.applicant.monthlyIncome + a.applicant.otherMonthlyIncome) },
        { label: 'Household Expenses', value: formatINR(a.applicant.monthlyExpenses) },
        { label: 'Existing EMI + Obligations', value: formatINR(a.totalMonthlyDebt) },
        { label: 'Disposable Income', value: formatINR(a.disposableIncome) },
        { label: 'Debt-to-Income Ratio', value: `${a.dti.toFixed(1)}%` },
      ],
    },
    {
      title: 'EMI Calculation',
      rows: [
        { label: 'Proposed EMI', value: `${formatINR(a.proposedEmi)}/month` },
        { label: 'Recommended Loan Amount', value: formatINR(a.recommendedLoanAmount) },
        { label: 'Recommended Tenure', value: `${a.recommendedTenureMonths} months` },
        { label: 'Estimated EMI', value: `${formatINR(a.estimatedEmi)}/month` },
        { label: 'Affordability Status', value: a.affordabilityStatus },
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="no-print flex items-center justify-between">
        <Link href={`/analysis/${a.id}`}>
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-1 h-4 w-4" /> Back to Result</Button>
        </Link>
        <Button onClick={() => window.print()}><Printer className="mr-1 h-4 w-4" /> Print / Save as PDF</Button>
      </div>

      <Card className="print-page">
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between border-b pb-6">
            <div>
              <h1 className="text-xl font-bold text-foreground">Loan Eligibility Assessment Report</h1>
              <p className="mt-1 text-sm text-muted-foreground">LoanAI Agent — Explainable Decision Engine</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Report ID: {a.id} · Generated: {new Date(a.createdAt).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="text-right">
              <ScoreGauge score={a.eligibilityScore} size={100} stroke={10} label={a.eligibilityTier} />
            </div>
          </div>

          {/* Summary badges */}
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Eligibility:</span>
              <EligibilityBadge tier={a.eligibilityTier} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Risk:</span>
              <RiskBadge tier={a.riskTier} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Eligibility Score:</span>
              <span className="text-sm font-semibold">{a.eligibilityScore}/100</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Risk Score:</span>
              <span className="text-sm font-semibold">{a.riskScore}/100</span>
            </div>
          </div>

          {/* Sections */}
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {sections.map((sec) => (
              <div key={sec.title}>
                <h3 className="mb-2 text-sm font-semibold text-foreground">{sec.title}</h3>
                <div className="rounded-lg border">
                  {sec.rows.map((row, i) => (
                    <div key={i} className={`flex justify-between px-3 py-2 text-sm ${i > 0 ? 'border-t' : ''}`}>
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-medium">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Explainable factors */}
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Explainable AI Factors</h3>
            <div className="space-y-2">
              {a.factors.map((f) => (
                <div key={f.key} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                  <div>
                    <span className="font-medium">{f.label}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{f.description}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">Weight {(f.weight * 100).toFixed(0)}%</span>
                    <span className="font-semibold">{f.score}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div className="mt-6 rounded-lg border bg-primary/5 p-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground">AI Agent Recommendation</h3>
            <p className="text-sm leading-relaxed text-foreground">{a.recommendation}</p>
            <h4 className="mt-4 mb-1 text-sm font-semibold">How to improve eligibility:</h4>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {a.improvements.map((imp, i) => <li key={i}>{imp}</li>)}
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 border-t pt-4">
            <p className="text-xs text-muted-foreground">
              Academic demonstration only. This report provides preliminary decision-support
              insights generated by an explainable scoring engine and does not represent an
              official lending decision by any financial institution.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
