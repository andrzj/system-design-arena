import type { JudgeResponse } from '@/lib/scoring/judge-rules';

export type ConsensusVerdict = 'pass' | 'borderline' | 'fail';

export type ConsensusResult = {
  averageScore: number;
  verdict: ConsensusVerdict;
  debateSummary: string;
  writtenFeedback: string;
};

export function computeVerdict(averageScore: number): ConsensusVerdict {
  if (averageScore >= 70) return 'pass';
  if (averageScore >= 50) return 'borderline';
  return 'fail';
}

export function buildConsensus(
  rigor: JudgeResponse,
  pragmatism: JudgeResponse,
): ConsensusResult {
  const averageScore = Math.round((rigor.score + pragmatism.score) / 2);
  const verdict = computeVerdict(averageScore);

  const debateSummary = [
    `Rigor (${rigor.score}/100): ${rigor.summary}`,
    `Pragmatism (${pragmatism.score}/100): ${pragmatism.summary}`,
  ].join('\n\n');

  const writtenFeedback = [
    '## Strengths',
    ...rigor.strengths.map((s) => `- ${s}`),
    ...pragmatism.strengths.filter((s) => !rigor.strengths.includes(s)).map((s) => `- ${s}`),
    '',
    '## Weaknesses',
    ...rigor.weaknesses.map((w) => `- ${w}`),
    ...pragmatism.weaknesses.filter((w) => !rigor.weaknesses.includes(w)).map((w) => `- ${w}`),
    '',
    `## Verdict: ${verdict.toUpperCase()} (${averageScore}/100)`,
  ].join('\n');

  return { averageScore, verdict, debateSummary, writtenFeedback };
}
