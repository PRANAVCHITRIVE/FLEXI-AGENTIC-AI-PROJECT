'use client';

import { Brain, Target, Network, Cpu, ArrowRight, Boxes, Cloud, FileSearch } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const OBJECTIVES = [
  'Automate preliminary financial analysis',
  'Evaluate repayment capacity',
  'Estimate loan affordability',
  'Assess risk across multiple dimensions',
  'Generate explainable recommendations',
  'Demonstrate AI-assisted financial decision support',
];

const ARCHITECTURE = [
  'Applicant Data',
  'Validation',
  'Feature Processing',
  'Financial Metrics',
  'Risk Engine',
  'Eligibility Score',
  'Explainable Factors',
  'Recommendation',
  'Report',
];

const TECH = ['React', 'TypeScript', 'Tailwind CSS', 'shadcn/ui', 'Recharts', 'LocalStorage', 'Explainable Scoring Engine'];

const FUTURE = [
  'Machine learning model integration',
  'Bank API integration',
  'Credit bureau integration',
  'Document verification',
  'Fraud detection',
  'OCR for document parsing',
  'LLM-powered financial assistant',
  'Cloud deployment',
];

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">AI Agent for Loan Eligibility Analysis</h2>
        <p className="mt-1 text-sm text-muted-foreground">An academic project demonstrating explainable AI-assisted financial decision support</p>
      </div>

      {/* Problem statement */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Problem Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Traditional preliminary loan assessment requires analyzing multiple financial
            parameters such as income, credit history, debt obligations, repayment history,
            and affordability. This project demonstrates an AI-assisted decision-support system
            capable of combining these indicators into an explainable loan eligibility assessment.
          </p>
        </CardContent>
      </Card>

      {/* Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Target className="h-4 w-4 text-primary" /> Objectives</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2">
            {OBJECTIVES.map((o, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {o}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Architecture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Network className="h-4 w-4 text-primary" /> System Architecture</CardTitle>
          <CardDescription>The decision-support pipeline from input to report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
            {ARCHITECTURE.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className="rounded-lg border bg-secondary/40 px-3 py-2 text-sm font-medium">
                  {step}
                </div>
                {i < ARCHITECTURE.length - 1 && <ArrowRight className="hidden h-4 w-4 text-muted-foreground lg:block" />}
                {i < ARCHITECTURE.length - 1 && <div className="h-4 w-px bg-border lg:hidden" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Model information */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Cpu className="h-4 w-4 text-primary" /> Model Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: 'Model Type', value: 'Explainable Demo Scoring Engine' },
              { label: 'Features', value: '10+ financial indicators' },
              { label: 'Output', value: 'Eligibility + Risk + Recommendation' },
              { label: 'Decision Type', value: 'Decision Support' },
              { label: 'Data', value: 'Demo / User-entered data' },
              { label: 'Scoring', value: 'Weighted multi-factor (0–100)' },
            ].map((m) => (
              <div key={m.label} className="rounded-lg border bg-card p-3">
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="mt-1 text-sm font-semibold">{m.value}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            This is an academic demonstration and does not claim to be an official banking
            underwriting model.
          </p>
        </CardContent>
      </Card>

      {/* Technologies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Boxes className="h-4 w-4 text-primary" /> Technologies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {TECH.map((t) => (
              <span key={t} className="rounded-full border bg-secondary/40 px-3 py-1.5 text-sm font-medium">{t}</span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Future scope */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Cloud className="h-4 w-4 text-primary" /> Future Scope</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2">
            {FUTURE.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {f}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-secondary/40 p-4 text-center">
        <p className="text-xs text-muted-foreground">
          Academic demonstration only. This tool provides preliminary decision-support insights
          and does not represent an official lending decision.
        </p>
      </div>
    </div>
  );
}
