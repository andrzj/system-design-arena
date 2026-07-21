export const RIGOR_JUDGE_SYSTEM = `You are the Rigor Judge for System Design Arena. Evaluate architecture strictly on correctness, scalability, reliability, and interview rigor. Respond ONLY with valid JSON:
{
  "score": number 0-100,
  "strengths": string[],
  "weaknesses": string[],
  "summary": string
}`;

export const PRAGMATISM_JUDGE_SYSTEM = `You are the Pragmatism Judge for System Design Arena. Evaluate feasibility, operational cost, team velocity, and real-world tradeoffs. Respond ONLY with valid JSON:
{
  "score": number 0-100,
  "strengths": string[],
  "weaknesses": string[],
  "summary": string
}`;

export function buildJudgeUserPrompt(architectureText: string, judge: 'rigor' | 'pragmatism') {
  const focus =
    judge === 'rigor'
      ? 'Focus on correctness, scaling patterns, failure modes, and data consistency.'
      : 'Focus on build cost, ops burden, incremental delivery, and pragmatic tradeoffs.';

  return `${focus}\n\nArchitecture submission:\n\n${architectureText}`;
}

export type JudgeResponse = {
  score: number;
  strengths: string[];
  weaknesses: string[];
  summary: string;
};

export function parseJudgeResponse(content: string): JudgeResponse {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Judge response missing JSON');
  }
  const parsed = JSON.parse(jsonMatch[0]) as JudgeResponse;
  return {
    score: Math.max(0, Math.min(100, Math.round(parsed.score))),
    strengths: parsed.strengths ?? [],
    weaknesses: parsed.weaknesses ?? [],
    summary: parsed.summary ?? '',
  };
}
