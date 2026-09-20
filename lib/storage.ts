import { AnalysisResult } from './types';
import { DEMO_APPLICANTS } from './demo-applicants';
import { analyzeApplicant } from './scoring';

const STORAGE_KEY = 'loanai_analyses_v1';

function seedDemoAnalyses(): AnalysisResult[] {
  const now = Date.now();
  return DEMO_APPLICANTS.map((d, i) => {
    const result = analyzeApplicant(d.data);
    result.id = `seed-${i}`;
    result.createdAt = new Date(now - (i + 1) * 86400000 * (i + 1)).toISOString();
    return result;
  });
}

export function loadAnalyses(): AnalysisResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedDemoAnalyses();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as AnalysisResult[];
  } catch {
    return [];
  }
}

export function saveAnalyses(analyses: AnalysisResult[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(analyses));
}

export function addAnalysis(result: AnalysisResult): AnalysisResult[] {
  const all = loadAnalyses();
  const updated = [result, ...all];
  saveAnalyses(updated);
  return updated;
}

export function deleteAnalysis(id: string): AnalysisResult[] {
  const all = loadAnalyses();
  const updated = all.filter((a) => a.id !== id);
  saveAnalyses(updated);
  return updated;
}

export function getAnalysis(id: string): AnalysisResult | undefined {
  return loadAnalyses().find((a) => a.id === id);
}
