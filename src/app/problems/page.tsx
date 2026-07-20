import React from 'react';
import { getProblems } from '@/lib/db';
import ProblemList from '@/components/problems/ProblemList';

export const dynamic = 'force-dynamic'; // fetch at request time

async function fetchProblems() {
  return getProblems();
}

export default async function ProblemsPage() {
  const problems = await fetchProblems();

  return <ProblemList initialProblems={problems} />;
}
