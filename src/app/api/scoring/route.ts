import { NextResponse } from 'next/server';

import { getUserTier, isPaidTier } from '@/lib/auth/tier';
import { createScoreResult } from '@/lib/db';
import { buildConsensus } from '@/lib/scoring/consensus';
import {
  RIGOR_JUDGE_SYSTEM,
  PRAGMATISM_JUDGE_SYSTEM,
  buildJudgeUserPrompt,
  parseJudgeResponse,
} from '@/lib/scoring/judge-rules';
import { chatCompletion } from '@/lib/scoring/openrouter';
import { serializeArchitecture, type SessionArchitecture } from '@/lib/scoring/serialize';
import { getSessionByUuidOrThrow } from '@/lib/sessions/helpers';
import { getProfileWithDailyReset } from '@/lib/utils/rate-limit-server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }

  const profile = await getProfileWithDailyReset(user.id);
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const tier = getUserTier(profile);
  const body = (await request.json()) as {
    sessionUuid?: string;
    architecture?: SessionArchitecture;
  };

  if (!body.sessionUuid || !body.architecture) {
    return NextResponse.json({ error: 'sessionUuid and architecture required' }, { status: 400 });
  }

  const session = await getSessionByUuidOrThrow(body.sessionUuid);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const architectureText = serializeArchitecture(body.architecture);
  const userPrompt = buildJudgeUserPrompt(architectureText, 'rigor');

  let rigorScore: number | null = null;
  let pragmatismScore: number | null = null;
  let consensusVerdict: string | null = null;
  let writtenFeedback: string;
  let debateSummary: string;
  let modelUsed = 'mock-judge';

  if (process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY) {
    try {
      const [rigorResult, pragmatismResult] = await Promise.all([
        chatCompletion([
          { role: 'system', content: RIGOR_JUDGE_SYSTEM },
          { role: 'user', content: userPrompt },
        ]),
        chatCompletion([
          { role: 'system', content: PRAGMATISM_JUDGE_SYSTEM },
          { role: 'user', content: buildJudgeUserPrompt(architectureText, 'pragmatism') },
        ]),
      ]);

      const rigor = parseJudgeResponse(rigorResult.content);
      const pragmatism = parseJudgeResponse(pragmatismResult.content);
      const consensus = buildConsensus(rigor, pragmatism);

      rigorScore = isPaidTier(tier) ? rigor.score : null;
      pragmatismScore = isPaidTier(tier) ? pragmatism.score : null;
      consensusVerdict = isPaidTier(tier) ? consensus.verdict : null;
      writtenFeedback = consensus.writtenFeedback;
      debateSummary = consensus.debateSummary;
      modelUsed = rigorResult.model;
    } catch {
      writtenFeedback = generateQualitativeFeedback(body.architecture);
      debateSummary = 'Judges reviewed your design qualitatively. Upgrade for numeric scores.';
    }
  } else {
    writtenFeedback = generateQualitativeFeedback(body.architecture);
    debateSummary = 'Judges reviewed your design qualitatively. Upgrade for numeric scores.';
  }

  const saved = await createScoreResult(session.id, user.id, {
    judgeRigorScore: rigorScore,
    judgePragmatismScore: pragmatismScore,
    consensusVerdict,
    writtenFeedback,
    debateSummary,
    modelUsed,
  });

  return NextResponse.json({
    id: saved.id,
    tier,
    rigorScore,
    pragmatismScore,
    consensusVerdict,
    writtenFeedback,
    debateSummary,
  });
}

function generateQualitativeFeedback(arch: SessionArchitecture): string {
  const hasCache = arch.nodes.some((n) => n.componentType.includes('cache'));
  const hasDb = arch.nodes.some((n) => n.componentType.includes('database') || n.componentType.includes('sql'));
  const lines = ['## Qualitative feedback', ''];

  if (hasDb) lines.push('- Good: persistence layer present.');
  else lines.push('- Consider adding a database for durable storage.');

  if (hasCache) lines.push('- Good: caching layer helps read-heavy traffic.');
  else if (arch.readWriteRatio > 0.8) lines.push('- Read-heavy workload may benefit from a cache.');

  if (arch.edges.length === 0) lines.push('- Connect components to show request/data flow.');
  else lines.push(`- Architecture has ${arch.edges.length} connection(s).`);

  lines.push('', '_Upgrade for numeric scores and pass/fail verdict._');
  return lines.join('\n');
}
