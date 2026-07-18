import React from 'react';
import { supabaseService } from '@/lib/supabase/service';
import ProblemList from '@/components/problems/ProblemList';

export const dynamic = 'force-static'; // pre-render at build time

async function fetchProblems() {
  return supabaseService.getProblems();
}

export default async function ProblemsPage() {
  const problems = await fetchProblems();

  return <ProblemList initialProblems={problems} />;
}
