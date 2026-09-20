import {
  ApplicantInput,
  AnalysisResult,
  FactorScore,
  RiskFactorScore,
  RiskTier,
  EligibilityTier,
} from './types';

export function calculateEMI(
  principal: number,
  annualRate: number,
  tenureMonths: number
): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / tenureMonths;
  return (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
}

export function formatINR(amount: number, compact = false): string {
  if (isNaN(amount) || !isFinite(amount)) return '₹0';
  if (compact) {
    if (Math.abs(amount) >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (Math.abs(amount) >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    if (Math.abs(amount) >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

function creditScoreFactor(score: number): { score: number; description: string; detail: string; impact: FactorScore['impact'] } {
  let s = 0;
  if (score >= 750) s = 95;
  else if (score >= 700) s = 82;
  else if (score >= 650) s = 68;
  else if (score >= 550) s = 45;
  else s = 25;

  let band = '';
  if (score >= 750) band = 'Excellent';
  else if (score >= 650) band = 'Good';
  else if (score >= 550) band = 'Fair';
  else band = 'Poor';

  return {
    score: s,
    description: `Credit score ${score} — ${band} band`,
    detail: `CIBIL score of ${score} falls in the ${band.toLowerCase()} range (300–900).`,
    impact: s >= 80 ? 'High Positive' : s >= 60 ? 'Positive' : s >= 40 ? 'Moderate' : 'Negative',
  };
}

function dtiFactor(totalMonthlyDebt: number, monthlyIncome: number): { score: number; dti: number; description: string; detail: string; impact: FactorScore['impact'] } {
  const dti = monthlyIncome > 0 ? (totalMonthlyDebt / monthlyIncome) * 100 : 100;
  let s = 0;
  if (dti <= 30) s = 95;
  else if (dti <= 40) s = 78;
  else if (dti <= 50) s = 55;
  else s = 28;

  let band = '';
  if (dti <= 30) band = 'Strong';
  else if (dti <= 40) band = 'Healthy';
  else if (dti <= 50) band = 'Elevated';
  else band = 'High Risk';

  return {
    score: s,
    dti,
    description: `DTI ${dti.toFixed(1)}% — ${band}`,
    detail: `Total monthly debt obligations are ${dti.toFixed(1)}% of monthly income (${band}).`,
    impact: s >= 80 ? 'High Positive' : s >= 60 ? 'Positive' : s >= 40 ? 'Moderate' : 'High Negative',
  };
}

function employmentFactor(type: string, years: number): { score: number; description: string; detail: string; impact: FactorScore['impact'] } {
  const typeWeight: Record<string, number> = {
    Salaried: 1.0,
    'Self Employed': 0.85,
    'Business Owner': 0.8,
    Freelancer: 0.65,
  };
  const tw = typeWeight[type] ?? 0.7;
  let yearsScore = 0;
  if (years >= 5) yearsScore = 95;
  else if (years >= 3) yearsScore = 82;
  else if (years >= 1) yearsScore = 65;
  else yearsScore = 40;
  const s = Math.round(yearsScore * tw);

  return {
    score: s,
    description: `${type}, ${years} yrs`,
    detail: `${type} employment with ${years} years of stability (stability weight ${tw}).`,
    impact: s >= 80 ? 'High Positive' : s >= 60 ? 'Positive' : s >= 40 ? 'Moderate' : 'Negative',
  };
}

function repaymentFactor(history: string): { score: number; description: string; detail: string; impact: FactorScore['impact'] } {
  const map: Record<string, number> = { Excellent: 95, Good: 78, Average: 55, Poor: 25 };
  const s = map[history] ?? 50;
  return {
    score: s,
    description: `${history} repayment history`,
    detail: `Previous repayment track record rated as ${history.toLowerCase()}.`,
    impact: s >= 80 ? 'High Positive' : s >= 60 ? 'Positive' : s >= 40 ? 'Moderate' : 'High Negative',
  };
}

function affordabilityFactor(proposedEmi: number, disposableIncome: number): { score: number; ratio: number; description: string; detail: string; impact: FactorScore['impact'] } {
  const ratio = disposableIncome > 0 ? (proposedEmi / disposableIncome) * 100 : 200;
  let s = 0;
  if (ratio <= 30) s = 95;
  else if (ratio <= 50) s = 80;
  else if (ratio <= 70) s = 58;
  else if (ratio <= 100) s = 38;
  else s = 18;

  return {
    score: s,
    ratio,
    description: `EMI uses ${ratio.toFixed(0)}% of disposable income`,
    detail: `Proposed EMI consumes ${ratio.toFixed(0)}% of disposable income after existing obligations.`,
    impact: s >= 80 ? 'High Positive' : s >= 60 ? 'Positive' : s >= 40 ? 'Moderate' : 'High Negative',
  };
}

function savingsFactor(monthlySavings: number, monthlyIncome: number): { score: number; rate: number; description: string; detail: string; impact: FactorScore['impact'] } {
  const rate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
  let s = 0;
  if (rate >= 25) s = 92;
  else if (rate >= 15) s = 78;
  else if (rate >= 8) s = 60;
  else if (rate >= 3) s = 40;
  else s = 22;

  return {
    score: s,
    rate,
    description: `Savings rate ${rate.toFixed(0)}%`,
    detail: `Monthly savings are ${rate.toFixed(0)}% of income, providing a financial cushion.`,
    impact: s >= 80 ? 'High Positive' : s >= 60 ? 'Positive' : s >= 40 ? 'Moderate' : 'Negative',
  };
}

function riskTierFromScore(score: number): RiskTier {
  if (score <= 30) return 'Low Risk';
  if (score <= 60) return 'Medium Risk';
  return 'High Risk';
}

function eligibilityTierFromScore(score: number): EligibilityTier {
  if (score >= 75) return 'Eligible';
  if (score >= 55) return 'Conditionally Eligible';
  return 'Not Eligible';
}

export function analyzeApplicant(input: ApplicantInput): AnalysisResult {
  const totalMonthlyIncome = input.monthlyIncome + input.otherMonthlyIncome;
  const totalMonthlyDebt = input.existingMonthlyEmi + input.otherObligations;
  const dti = totalMonthlyIncome > 0 ? (totalMonthlyDebt / totalMonthlyIncome) * 100 : 100;
  const disposableIncome = totalMonthlyIncome - input.monthlyExpenses - totalMonthlyDebt;
  const tenureMonths = Math.round(input.loanTenureYears * 12);
  const proposedEmi = calculateEMI(input.loanAmount, input.interestRate, tenureMonths);

  const credit = creditScoreFactor(input.creditScore);
  const dtiF = dtiFactor(totalMonthlyDebt, totalMonthlyIncome);
  const emp = employmentFactor(input.employmentType, input.employmentDurationYears);
  const repay = repaymentFactor(input.repaymentHistory);
  const afford = affordabilityFactor(proposedEmi, disposableIncome);
  const savings = savingsFactor(input.monthlySavings, totalMonthlyIncome);

  const weights = {
    credit: 0.25,
    dti: 0.2,
    employment: 0.15,
    repayment: 0.15,
    affordability: 0.15,
    savings: 0.1,
  };

  const factors: FactorScore[] = [
    {
      key: 'credit',
      label: 'Credit Score',
      score: credit.score,
      weight: weights.credit,
      weightedContribution: credit.score * weights.credit,
      impact: credit.impact,
      description: credit.description,
      detail: credit.detail,
    },
    {
      key: 'dti',
      label: 'Debt-to-Income Ratio',
      score: dtiF.score,
      weight: weights.dti,
      weightedContribution: dtiF.score * weights.dti,
      impact: dtiF.impact,
      description: dtiF.description,
      detail: dtiF.detail,
    },
    {
      key: 'employment',
      label: 'Income Stability',
      score: emp.score,
      weight: weights.employment,
      weightedContribution: emp.score * weights.employment,
      impact: emp.impact,
      description: emp.description,
      detail: emp.detail,
    },
    {
      key: 'repayment',
      label: 'Repayment History',
      score: repay.score,
      weight: weights.repayment,
      weightedContribution: repay.score * weights.repayment,
      impact: repay.impact,
      description: repay.description,
      detail: repay.detail,
    },
    {
      key: 'affordability',
      label: 'Loan Affordability',
      score: afford.score,
      weight: weights.affordability,
      weightedContribution: afford.score * weights.affordability,
      impact: afford.impact,
      description: afford.description,
      detail: afford.detail,
    },
    {
      key: 'savings',
      label: 'Savings / Cushion',
      score: savings.score,
      weight: weights.savings,
      weightedContribution: savings.score * weights.savings,
      impact: savings.impact,
      description: savings.description,
      detail: savings.detail,
    },
  ];

  const eligibilityScore = Math.round(
    factors.reduce((sum, f) => sum + f.weightedContribution, 0)
  );

  // Risk score — multi-factor, not a simple inversion
  const creditRisk = Math.max(0, 100 - credit.score);
  const debtRisk = Math.min(100, dti * 1.4);
  const incomeRisk = Math.max(0, 100 - emp.score);
  const repaymentRisk = Math.max(0, 100 - repay.score);
  const affordabilityRisk = Math.min(100, Math.max(0, (afford.ratio - 30) * 1.2));
  const savingsRisk = Math.max(0, 100 - savings.score);

  const riskFactors: RiskFactorScore[] = [
    {
      key: 'creditRisk',
      label: 'Credit Risk',
      score: Math.round(creditRisk),
      status: creditRisk <= 30 ? 'Low' : creditRisk <= 60 ? 'Medium' : 'High',
      explanation: `Based on credit score of ${input.creditScore}.`,
    },
    {
      key: 'debtRisk',
      label: 'Debt Risk',
      score: Math.round(debtRisk),
      status: debtRisk <= 30 ? 'Low' : debtRisk <= 60 ? 'Medium' : 'High',
      explanation: `DTI of ${dti.toFixed(1)}% relative to monthly income.`,
    },
    {
      key: 'incomeRisk',
      label: 'Income Stability',
      score: Math.round(incomeRisk),
      status: incomeRisk <= 30 ? 'Low' : incomeRisk <= 60 ? 'Medium' : 'High',
      explanation: `${input.employmentType} with ${input.employmentDurationYears} years tenure.`,
    },
    {
      key: 'repaymentRisk',
      label: 'Repayment Risk',
      score: Math.round(repaymentRisk),
      status: repaymentRisk <= 30 ? 'Low' : repaymentRisk <= 60 ? 'Medium' : 'High',
      explanation: `${input.repaymentHistory} prior repayment history.`,
    },
    {
      key: 'affordabilityRisk',
      label: 'Affordability Risk',
      score: Math.round(affordabilityRisk),
      status: affordabilityRisk <= 30 ? 'Low' : affordabilityRisk <= 60 ? 'Medium' : 'High',
      explanation: `Proposed EMI uses ${afford.ratio.toFixed(0)}% of disposable income.`,
    },
    {
      key: 'savingsRisk',
      label: 'Savings Risk',
      score: Math.round(savingsRisk),
      status: savingsRisk <= 30 ? 'Low' : savingsRisk <= 60 ? 'Medium' : 'High',
      explanation: `Savings rate of ${savings.rate.toFixed(0)}% of income.`,
    },
  ];

  const riskScore = Math.round(
    creditRisk * 0.25 +
      debtRisk * 0.2 +
      incomeRisk * 0.15 +
      repaymentRisk * 0.15 +
      affordabilityRisk * 0.15 +
      savingsRisk * 0.1
  );

  const positiveFactors = factors.filter((f) => f.score >= 60);
  const riskFlagFactors = factors.filter((f) => f.score < 60);

  const eligibilityTier = eligibilityTierFromScore(eligibilityScore);
  const riskTier = riskTierFromScore(riskScore);

  // Recommendation
  let recommendation = '';
  if (eligibilityTier === 'Eligible') {
    recommendation = `Based on the applicant's financial profile, credit strength (${input.creditScore}), manageable debt obligations (DTI ${dti.toFixed(1)}%), and estimated repayment capacity, the requested ${input.loanType.toLowerCase()} of ${formatINR(input.loanAmount, true)} is within an acceptable affordability range. The AI decision engine recommends approval with standard terms.`;
  } else if (eligibilityTier === 'Conditionally Eligible') {
    recommendation = `The applicant shows moderate eligibility. While credit and income indicators are acceptable, certain risk factors (DTI ${dti.toFixed(1)}%, affordability ${afford.ratio.toFixed(0)}% of disposable income) suggest conditional approval. A reduced loan amount or longer tenure may improve affordability.`;
  } else {
    recommendation = `The applicant's current financial profile indicates significant risk factors. High debt obligations (DTI ${dti.toFixed(1)}%) and limited affordability (${afford.ratio.toFixed(0)}% of disposable income consumed by proposed EMI) make the requested loan unsuitable at this time. Recommend improving key financial indicators before reapplying.`;
  }

  // Improvements
  const improvements: string[] = [];
  if (dti > 40) improvements.push('Reduce existing EMI obligations to lower your debt-to-income ratio below 40%.');
  if (savings.rate < 15) improvements.push('Increase your monthly savings buffer to at least 15% of income for a stronger financial cushion.');
  if (input.creditScore < 750) improvements.push('Improve your credit score above 750 by maintaining consistent repayment behavior and lowering credit utilization.');
  if (afford.ratio > 50) improvements.push('Reduce the requested loan amount or extend the tenure to lower the EMI burden on disposable income.');
  if (input.repaymentHistory !== 'Excellent') improvements.push('Strengthen repayment history by ensuring all existing EMIs are paid on time consistently.');
  if (improvements.length === 0) improvements.push('Maintain your strong financial profile and stable income to preserve eligibility.');

  // Recommended loan amount — scale based on affordability
  const maxEmiCapacity = disposableIncome * 0.5;
  let recommendedLoanAmount = input.loanAmount;
  if (proposedEmi > maxEmiCapacity && maxEmiCapacity > 0) {
    // back-calculate a principal that yields EMI within capacity
    const r = input.interestRate / 100 / 12;
    if (r > 0) {
      recommendedLoanAmount = Math.round(
        (maxEmiCapacity * (Math.pow(1 + r, tenureMonths) - 1)) / (r * Math.pow(1 + r, tenureMonths))
      );
    }
  }
  const recommendedTenureMonths = tenureMonths;
  const estimatedInterestRate = input.interestRate;
  const estimatedEmi = calculateEMI(recommendedLoanAmount, estimatedInterestRate, recommendedTenureMonths);

  const affordabilityRatio = disposableIncome > 0 ? (proposedEmi / disposableIncome) * 100 : 200;
  let affordabilityStatus: AnalysisResult['affordabilityStatus'] = 'Affordable';
  if (affordabilityRatio > 100) affordabilityStatus = 'Not Affordable';
  else if (affordabilityRatio > 50) affordabilityStatus = 'Needs Review';

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    applicant: input,
    eligibilityScore,
    eligibilityTier,
    riskScore,
    riskTier,
    dti,
    disposableIncome,
    proposedEmi,
    totalMonthlyDebt,
    recommendedLoanAmount,
    recommendedTenureMonths,
    estimatedInterestRate,
    estimatedEmi,
    factors,
    riskFactors,
    positiveFactors,
    riskFlagFactors,
    recommendation,
    improvements,
    affordabilityStatus,
    affordabilityRatio,
  };
}
