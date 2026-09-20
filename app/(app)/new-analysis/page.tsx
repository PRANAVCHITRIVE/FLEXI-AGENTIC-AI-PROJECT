'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Briefcase,
  CreditCard,
  Landmark,
  Wallet,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Users,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { ApplicantInput, EmploymentType, LoanType, RepaymentHistory } from '@/lib/types';
import { DEMO_APPLICANTS, EMPTY_APPLICANT } from '@/lib/demo-applicants';
import { analyzeApplicant, calculateEMI, formatINR } from '@/lib/scoring';
import { addAnalysis } from '@/lib/storage';
import { cn } from '@/lib/utils';

const STEPS = [
  { key: 'personal', label: 'Personal', icon: User },
  { key: 'employment', label: 'Employment', icon: Briefcase },
  { key: 'credit', label: 'Credit', icon: CreditCard },
  { key: 'loan', label: 'Loan', icon: Landmark },
  { key: 'expenses', label: 'Expenses', icon: Wallet },
  { key: 'review', label: 'Review', icon: ClipboardCheck },
];

const EMPLOYMENT_TYPES: EmploymentType[] = ['Salaried', 'Self Employed', 'Business Owner', 'Freelancer'];
const LOAN_TYPES: LoanType[] = ['Personal Loan', 'Home Loan', 'Education Loan', 'Vehicle Loan', 'Business Loan'];
const REPAYMENT_OPTIONS: RepaymentHistory[] = ['Excellent', 'Good', 'Average', 'Poor'];

function FieldLabel({ children, tooltip }: { children: React.ReactNode; tooltip?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Label className="text-sm font-medium">{children}</Label>
      {tooltip && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent className="max-w-48">{tooltip}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  tooltip,
  prefix,
  suffix,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  tooltip?: string;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel tooltip={tooltip}>{label}</FieldLabel>
      <div className="relative">
        {prefix && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{prefix}</span>}
        <Input
          type="number"
          value={value || ''}
          min={min}
          max={max}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(prefix && 'pl-7', suffix && 'pr-12')}
        />
        {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

export default function NewAnalysisPage() {
  return (
    <Suspense fallback={<div className="flex h-40 items-center justify-center text-muted-foreground">Loading...</div>}>
      <NewAnalysisContent />
    </Suspense>
  );
}

function NewAnalysisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ApplicantInput>(EMPTY_APPLICANT);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const demoIdx = searchParams.get('demo');
    if (demoIdx !== null) {
      const idx = Number(demoIdx);
      if (idx >= 0 && idx < DEMO_APPLICANTS.length) {
        setForm({ ...DEMO_APPLICANTS[idx].data });
        toast({ title: 'Demo applicant loaded', description: DEMO_APPLICANTS[idx].label });
      }
    }
  }, [searchParams, toast]);

  const update = (patch: Partial<ApplicantInput>) => setForm((f) => ({ ...f, ...patch }));

  const totalIncome = form.monthlyIncome + form.otherMonthlyIncome;
  const totalDebt = form.existingMonthlyEmi + form.otherObligations;
  const disposable = totalIncome - form.monthlyExpenses - totalDebt;
  const tenureMonths = Math.round(form.loanTenureYears * 12);
  const liveEmi = calculateEMI(form.loanAmount, form.interestRate, tenureMonths);

  const creditBand =
    form.creditScore >= 750 ? { label: 'Excellent', color: 'text-green-600' } :
    form.creditScore >= 650 ? { label: 'Good', color: 'text-blue-600' } :
    form.creditScore >= 550 ? { label: 'Fair', color: 'text-amber-600' } :
    { label: 'Poor', color: 'text-red-600' };

  const canProceed = () => {
    if (step === 0) return form.fullName.trim() && form.age >= 18 && form.age <= 70 && form.dependents >= 0;
    if (step === 1) return form.monthlyIncome > 0 && form.employmentDurationYears >= 0;
    if (step === 2) return form.creditScore >= 300 && form.creditScore <= 900;
    if (step === 3) return form.loanAmount > 0 && form.loanTenureYears > 0;
    if (step === 4) return form.monthlyExpenses >= 0;
    return true;
  };

  const runAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      const result = analyzeApplicant(form);
      addAnalysis(result);
      router.push(`/analysis/${result.id}?new=1`);
    }, 3000);
  };

  if (analyzing) {
    return <AnalysisAnimation />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Progress */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">New Loan Analysis</h2>
          <span className="text-sm text-muted-foreground">Step {step + 1} of {STEPS.length}</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.key} className="flex flex-1 items-center">
                <button
                  onClick={() => i < step && setStep(i)}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium transition-colors',
                    i === step ? 'bg-primary text-primary-foreground' :
                    i < step ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  )}
                >
                  <span className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs',
                    i === step ? 'bg-primary-foreground text-primary' :
                    i < step ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                  )}>
                    {i < step ? '✓' : i + 1}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && <div className="h-px flex-1 bg-border" />}
              </div>
            );
          })}
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} className="mt-3 h-1" />
      </div>

      {/* Demo applicants */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-wrap items-center gap-2 p-4">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Load demo applicant:</span>
          {DEMO_APPLICANTS.map((d, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              onClick={() => setForm({ ...d.data })}
            >
              {d.label.split(' — ')[1]}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Steps */}
      {step === 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Personal Profile</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <FieldLabel tooltip="Full legal name of the loan applicant">Full Name</FieldLabel>
              <Input value={form.fullName} onChange={(e) => update({ fullName: e.target.value })} placeholder="e.g. Rahul Sharma" />
            </div>
            <NumberField label="Age" value={form.age} onChange={(v) => update({ age: v })} min={18} max={70} tooltip="Applicant age (18–70)" />
            <div className="space-y-1.5">
              <FieldLabel tooltip="City of residence">City</FieldLabel>
              <Input value={form.city} onChange={(e) => update({ city: e.target.value })} placeholder="e.g. Pune" />
            </div>
            <NumberField label="Number of Dependents" value={form.dependents} onChange={(v) => update({ dependents: v })} min={0} tooltip="People financially dependent on the applicant" />
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Employment & Income</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <FieldLabel tooltip="Type of employment affects income stability weighting">Employment Type</FieldLabel>
              <Select value={form.employmentType} onValueChange={(v) => update({ employmentType: v as EmploymentType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <NumberField label="Monthly Income" prefix="₹" value={form.monthlyIncome} onChange={(v) => update({ monthlyIncome: v })} min={0} tooltip="Primary monthly income" />
            <NumberField label="Other Monthly Income" prefix="₹" value={form.otherMonthlyIncome} onChange={(v) => update({ otherMonthlyIncome: v })} min={0} tooltip="Rental, freelance, or other recurring income" />
            <NumberField label="Employment Duration" suffix="years" value={form.employmentDurationYears} onChange={(v) => update({ employmentDurationYears: v })} min={0} tooltip="Years in current employment" />
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Credit & Debt</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField label="Credit / CIBIL Score" value={form.creditScore} onChange={(v) => update({ creditScore: v })} min={300} max={900} tooltip="Credit bureau score (300–900)" />
              <div className="space-y-1.5">
                <FieldLabel tooltip="Prior repayment track record">Repayment History</FieldLabel>
                <Select value={form.repaymentHistory} onValueChange={(v) => update({ repaymentHistory: v as RepaymentHistory })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {REPAYMENT_OPTIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <NumberField label="Existing Loan Balance" prefix="₹" value={form.existingLoanBalance} onChange={(v) => update({ existingLoanBalance: v })} min={0} />
              <NumberField label="Existing Monthly EMI" prefix="₹" value={form.existingMonthlyEmi} onChange={(v) => update({ existingMonthlyEmi: v })} min={0} />
              <NumberField label="Number of Active Loans" value={form.activeLoans} onChange={(v) => update({ activeLoans: v })} min={0} />
            </div>
            {/* Credit band visual */}
            <div className="rounded-lg border bg-secondary/40 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Credit score interpretation</span>
                <span className={cn('font-semibold', creditBand.color)}>{form.creditScore} — {creditBand.label}</span>
              </div>
              <div className="relative mt-3 h-2 rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-green-500">
                <div
                  className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-foreground shadow"
                  style={{ left: `${((form.creditScore - 300) / 600) * 100}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                <span>300 Poor</span><span>550 Fair</span><span>650 Good</span><span>750 Excellent</span><span>900</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Loan Request</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <FieldLabel>Loan Type</FieldLabel>
                <Select value={form.loanType} onValueChange={(v) => update({ loanType: v as LoanType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LOAN_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <NumberField label="Requested Loan Amount" prefix="₹" value={form.loanAmount} onChange={(v) => update({ loanAmount: v })} min={0} />
              <NumberField label="Loan Tenure" suffix="years" value={form.loanTenureYears} onChange={(v) => update({ loanTenureYears: v })} min={1} max={30} />
              <NumberField label="Preferred Interest Rate" suffix="%" value={form.interestRate} onChange={(v) => update({ interestRate: v })} min={0} max={36} />
            </div>
            <div className="rounded-lg border bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estimated EMI ({tenureMonths} months)</span>
                <span className="text-lg font-bold text-primary">{formatINR(liveEmi)}/mo</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Monthly Financial Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <NumberField label="Household Expenses" prefix="₹" value={form.monthlyExpenses} onChange={(v) => update({ monthlyExpenses: v })} min={0} />
              <NumberField label="Monthly Savings" prefix="₹" value={form.monthlySavings} onChange={(v) => update({ monthlySavings: v })} min={0} />
              <NumberField label="Other Obligations" prefix="₹" value={form.otherObligations} onChange={(v) => update({ otherObligations: v })} min={0} />
            </div>
            <div className="rounded-lg border bg-secondary/40 p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Total Income</span><span className="font-medium">{formatINR(totalIncome)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">− Household Expenses</span><span>{formatINR(form.monthlyExpenses)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">− Existing EMI & Obligations</span><span>{formatINR(totalDebt)}</span></div>
                <div className="flex justify-between border-t pt-2 text-base font-semibold">
                  <span>= Disposable Income</span>
                  <span className={disposable >= 0 ? 'text-green-600' : 'text-red-600'}>{formatINR(disposable)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Review & Confirm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: 'Personal Profile', icon: User, data: [`${form.fullName}, ${form.age}`, form.city, `${form.dependents} dependents`] },
                { title: 'Employment', icon: Briefcase, data: [form.employmentType, `${formatINR(form.monthlyIncome)}/mo + ${formatINR(form.otherMonthlyIncome)}`, `${form.employmentDurationYears} years`] },
                { title: 'Credit Profile', icon: CreditCard, data: [`Score ${form.creditScore}`, `${form.repaymentHistory} history`, `${formatINR(form.existingLoanBalance, true)} existing`, `${form.activeLoans} active loans`] },
                { title: 'Loan Request', icon: Landmark, data: [form.loanType, formatINR(form.loanAmount, true), `${form.loanTenureYears} yrs @ ${form.interestRate}%`] },
                { title: 'Monthly Finances', icon: Wallet, data: [`Expenses ${formatINR(form.monthlyExpenses)}`, `Savings ${formatINR(form.monthlySavings)}`, `Disposable ${formatINR(disposable)}`] },
              ].map((sec) => {
                const Icon = sec.icon;
                return (
                  <div key={sec.title} className="flex items-start justify-between rounded-lg border p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-4.5 w-4.5 text-primary" style={{ width: 18, height: 18 }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{sec.title}</p>
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                          {sec.data.map((d, i) => <span key={i}>{d}</span>)}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setStep(STEPS.findIndex((s) => s.label.toLowerCase().includes(sec.title.toLowerCase().split(' ')[0])))}>
                      Edit
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
          <div className="flex justify-center">
            <Button size="lg" onClick={runAnalysis} className="gap-2">
              <Sparkles className="h-4 w-4" /> Run AI Analysis
            </Button>
          </div>
        </div>
      )}

      {/* Nav buttons */}
      {step < 5 && (
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={!canProceed()}>
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function AnalysisAnimation() {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  const stages = [
    'Data validation',
    'Income analysis',
    'Credit assessment',
    'Debt-to-income calculation',
    'Affordability analysis',
    'Repayment risk assessment',
    'Eligibility scoring',
    'Recommendation generation',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => Math.min(100, p + 2));
    }, 60);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setStage(Math.min(stages.length - 1, Math.floor((progress / 100) * stages.length)));
  }, [progress, stages.length]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="w-full max-w-md text-center">
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-foreground">LoanAI Agent</h2>
        <p className="mt-1 text-sm text-muted-foreground">Analyzing applicant profile...</p>

        <div className="mt-6">
          <Progress value={progress} className="h-2" />
          <p className="mt-1.5 text-xs text-muted-foreground">{progress}%</p>
        </div>

        <div className="mt-6 space-y-2 text-left">
          {stages.map((s, i) => (
            <div
              key={s}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all',
                i < stage ? 'text-green-600' : i === stage ? 'bg-primary/5 text-primary' : 'text-muted-foreground/50'
              )}
            >
              {i < stage ? <span className="text-green-600">✓</span> : i === stage ? <span className="h-2 w-2 animate-pulse rounded-full bg-primary" /> : <span className="h-2 w-2 rounded-full bg-muted" />}
              {s}
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-muted-foreground">Explainable financial decision engine</p>
      </div>
    </div>
  );
}
