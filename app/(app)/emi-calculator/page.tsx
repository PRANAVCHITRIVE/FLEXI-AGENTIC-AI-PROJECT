'use client';

import { useState } from 'react';
import { Calculator, TrendingUp, Percent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { MetricCard } from '@/components/metric-card';
import { calculateEMI, formatINR } from '@/lib/scoring';
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
  CartesianGrid,
  Legend,
} from 'recharts';

export default function EmiCalculatorPage() {
  const [amount, setAmount] = useState(1000000);
  const [rate, setRate] = useState(10.5);
  const [tenure, setTenure] = useState(5);

  const months = Math.round(tenure * 12);
  const emi = calculateEMI(amount, rate, months);
  const totalInterest = emi * months - amount;
  const totalRepayment = emi * months;

  const pieData = [
    { name: 'Principal', value: amount, fill: 'hsl(217 91% 50%)' },
    { name: 'Interest', value: Math.max(0, totalInterest), fill: 'hsl(199 89% 48%)' },
  ].filter((d) => d.value > 0);

  // Yearly breakdown for bar chart
  const yearlyData: { year: string; principal: number; interest: number; balance: number }[] = [];
  let balance = amount;
  const r = rate / 100 / 12;
  for (let y = 1; y <= Math.ceil(tenure); y++) {
    let yearPrincipal = 0;
    let yearInterest = 0;
    for (let m = 0; m < 12 && balance > 0; m++) {
      const interestPart = balance * r;
      const principalPart = emi - interestPart;
      yearPrincipal += principalPart;
      yearInterest += interestPart;
      balance -= principalPart;
    }
    yearlyData.push({
      year: `Yr ${y}`,
      principal: Math.round(yearPrincipal),
      interest: Math.round(yearInterest),
      balance: Math.max(0, Math.round(balance)),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">EMI Calculator</h2>
        <p className="text-sm text-muted-foreground">
          Calculate monthly EMI, total interest, and repayment breakdown using the standard formula.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calculator className="h-4 w-4 text-primary" /> Loan Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Loan Amount</Label>
                <span className="text-sm font-semibold">{formatINR(amount)}</span>
              </div>
              <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
              <Slider value={[amount]} min={50000} max={10000000} step={50000} onValueChange={(v) => setAmount(v[0])} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Interest Rate (% per annum)</Label>
                <span className="text-sm font-semibold">{rate}%</span>
              </div>
              <Input type="number" step={0.1} value={rate} onChange={(e) => setRate(Number(e.target.value))} />
              <Slider value={[rate]} min={1} max={24} step={0.1} onValueChange={(v) => setRate(v[0])} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Loan Tenure (years)</Label>
                <span className="text-sm font-semibold">{tenure} years ({months} months)</span>
              </div>
              <Input type="number" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} />
              <Slider value={[tenure]} min={1} max={30} step={1} onValueChange={(v) => setTenure(v[0])} />
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard icon={Calculator} label="Monthly EMI" value={formatINR(emi)} iconClass="bg-primary/10" />
            <MetricCard icon={Percent} label="Total Interest" value={formatINR(totalInterest, true)} iconClass="bg-amber-500/10" />
            <MetricCard icon={TrendingUp} label="Total Repayment" value={formatINR(totalRepayment, true)} iconClass="bg-green-500/10" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Principal vs Interest</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                      {pieData.map((d) => <Cell key={d.name} fill={d.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatINR(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Repayment breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Repayment Breakdown (Yearly)</CardTitle>
          <CardDescription>Principal vs interest paid each year over the loan tenure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlyData} margin={{ left: 0, right: 16, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => formatINR(v, true)} tick={{ fontSize: 11 }} width={70} />
                <Tooltip formatter={(v: number) => formatINR(v)} />
                <Legend />
                <Bar dataKey="principal" stackId="a" fill="hsl(217 91% 50%)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="interest" stackId="a" fill="hsl(199 89% 48%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
