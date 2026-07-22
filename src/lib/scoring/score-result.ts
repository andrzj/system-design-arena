export type JudgeScoreResult = {
  rigorScore: number | null;
  pragmatismScore: number | null;
  consensusVerdict: 'pass' | 'borderline' | 'fail' | null;
  writtenFeedback: string;
  debateSummary: string;
};
