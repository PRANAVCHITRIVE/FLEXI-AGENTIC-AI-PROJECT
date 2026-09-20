export type EmploymentType =
  | 'Salaried'
  | 'Self Employed'
  | 'Business Owner'
  | 'Freelancer';

export type LoanType =
  | 'Personal Loan'
  | 'Home Loan'
  | 'Education Loan'
  | 'Vehicle Loan'
  | 'Business Loan';

export type RepaymentHistory = 'Excellent' | 'Good' | 'Average' | 'Poor';

export interface ApplicantInput {
  fullName: string;
  age: number;
  city: string;
  dependents: number;

  employmentType: EmploymentType;
  monthlyIncome: number;
  otherMonthlyIncome: number;
  employmentDurationYears: number;

  creditScore: number;
  existingLoanBalance: number;
  existingMonthlyEmi: number;
  activeLoans: number;
  repaymentHistory: RepaymentHistory;

  loanType: LoanType;
  loanAmount: number;
  loanTenureYears: number;
  interestRate: number;

  monthlyExpenses: number;
  monthlySavings: number;
  otherObligations: number;
}

export type EligibilityTier = 'Eligible' | 'Conditionally Eligible' | 'Not Eligible';
export type RiskTier = 'Low Risk' | 'Medium Risk' | 'High Risk';

export interface FactorScore {
  key: string;
  label: string;
  score: number; // 0-100
  weight: number; // 0-1
  weightedContribution: number; // 0-100
  impact: 'High Positive' | 'Positive' | 'Moderate' | 'Negative' | 'High Negative';
  description: string;
  detail: string;
}

export interface RiskFactorScore {
  key: string;
  label: string;
  score: number; // 0-100 (higher = more risk)
  status: 'Low' | 'Medium' | 'High';
  explanation: string;
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
  applicant: ApplicantInput;

  eligibilityScore: number;
  eligibilityTier: EligibilityTier;
  riskScore: number;
  riskTier: RiskTier;

  dti: number;
  disposableIncome: number;
  proposedEmi: number;
  totalMonthlyDebt: number;
  recommendedLoanAmount: number;
  recommendedTenureMonths: number;
  estimatedInterestRate: number;
  estimatedEmi: number;

  factors: FactorScore[];
  riskFactors: RiskFactorScore[];
  positiveFactors: FactorScore[];
  riskFlagFactors: FactorScore[];

  recommendation: string;
  improvements: string[];

  affordabilityStatus: 'Affordable' | 'Needs Review' | 'Not Affordable';
  affordabilityRatio: number;
}
