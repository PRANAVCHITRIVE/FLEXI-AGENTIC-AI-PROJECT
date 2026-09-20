'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Trash2, Eye, History as HistoryIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EligibilityBadge, RiskBadge } from '@/components/score-badges';
import { loadAnalyses, deleteAnalysis } from '@/lib/storage';
import { AnalysisResult, EligibilityTier, RiskTier, LoanType } from '@/lib/types';
import { formatINR } from '@/lib/scoring';
import { useToast } from '@/hooks/use-toast';

export default function HistoryPage() {
  const { toast } = useToast();
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [search, setSearch] = useState('');
  const [eligFilter, setEligFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [loanFilter, setLoanFilter] = useState<string>('all');

  useEffect(() => {
    setAnalyses(loadAnalyses());
  }, []);

  const filtered = analyses.filter((a) => {
    if (search && !a.applicant.fullName.toLowerCase().includes(search.toLowerCase())) return false;
    if (eligFilter !== 'all' && a.eligibilityTier !== eligFilter) return false;
    if (riskFilter !== 'all' && a.riskTier !== riskFilter) return false;
    if (loanFilter !== 'all' && a.applicant.loanType !== loanFilter) return false;
    return true;
  });

  const loanTypes = Array.from(new Set(analyses.map((a) => a.applicant.loanType)));

  const handleDelete = (id: string) => {
    const updated = deleteAnalysis(id);
    setAnalyses(updated);
    toast({ title: 'Analysis deleted', description: 'The record has been removed.' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Analysis History</h2>
          <p className="text-sm text-muted-foreground">All saved loan eligibility assessments</p>
        </div>
        <Link href="/new-analysis"><Button size="sm">New Analysis</Button></Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search applicant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={eligFilter} onValueChange={setEligFilter}>
            <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Eligibility" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Eligibility</SelectItem>
              <SelectItem value="Eligible">Eligible</SelectItem>
              <SelectItem value="Conditionally Eligible">Conditionally Eligible</SelectItem>
              <SelectItem value="Not Eligible">Not Eligible</SelectItem>
            </SelectContent>
          </Select>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Risk" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk</SelectItem>
              <SelectItem value="Low Risk">Low Risk</SelectItem>
              <SelectItem value="Medium Risk">Medium Risk</SelectItem>
              <SelectItem value="High Risk">High Risk</SelectItem>
            </SelectContent>
          </Select>
          <Select value={loanFilter} onValueChange={setLoanFilter}>
            <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="Loan Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Loan Types</SelectItem>
              {loanTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <HistoryIcon className="h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-medium text-foreground">No analyses found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {analyses.length === 0 ? 'Run a new analysis to get started.' : 'Try adjusting your filters.'}
              </p>
              {analyses.length === 0 && (
                <Link href="/new-analysis" className="mt-4">
                  <Button size="sm">Start New Analysis</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Applicant</th>
                    <th className="px-4 py-3 font-medium">Loan Type</th>
                    <th className="px-4 py-3 font-medium">Loan Amount</th>
                    <th className="px-4 py-3 font-medium">Credit</th>
                    <th className="px-4 py-3 font-medium">Eligibility</th>
                    <th className="px-4 py-3 font-medium">Risk</th>
                    <th className="px-4 py-3 font-medium">Score</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{a.applicant.fullName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.applicant.loanType}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatINR(a.applicant.loanAmount, true)}</td>
                      <td className="px-4 py-3">{a.applicant.creditScore}</td>
                      <td className="px-4 py-3"><EligibilityBadge tier={a.eligibilityTier} /></td>
                      <td className="px-4 py-3"><RiskBadge tier={a.riskTier} /></td>
                      <td className="px-4 py-3 font-semibold">{a.eligibilityScore}/100</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(a.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Link href={`/analysis/${a.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                          </Link>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDelete(a.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
