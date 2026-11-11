// Second-opinion check for AI-written quizzes: an independent pass answers every question
// WITHOUT seeing the key. Questions where the two disagree are dropped, because one of the two
// (the question, the key or the verifier) is wrong and a learner should never be taught a wrong "fact".
export type QuizQuestion = { question: string; options: string[]; correct_index: number; explanation: string };
export type VerifierAnswer = { index: number; choice: number };

export function filterByAgreement(
  questions: QuizQuestion[],
  answers: VerifierAnswer[],
  minKeep = 3,
): { kept: QuizQuestion[]; dropped: number; verified: boolean } {
  const byIndex = new Map(answers.map((a) => [a.index, a.choice]));
  if (byIndex.size === 0) return { kept: questions, dropped: 0, verified: false };
  const kept = questions.filter((q, i) => !byIndex.has(i) || byIndex.get(i) === q.correct_index);
  // never shrink a quiz below a usable size: better an unverified quiz than none
  if (kept.length < minKeep) return { kept: questions, dropped: 0, verified: false };
  return { kept, dropped: questions.length - kept.length, verified: true };
}

export function stripKeys(questions: QuizQuestion[] | Array<Record<string, unknown>>) {
  return (questions as Array<Record<string, unknown>>).map((q) => ({ question: q.question as string, options: q.options as string[] }));
}

export function verifierPrompt(questions: QuizQuestion[]): string {
  const body = questions
    .map((q, i) => `${i}. ${q.question}\n${q.options.map((o, j) => `   ${j}) ${o}`).join("\n")}`)
    .join("\n\n");
  return `Answer each multiple-choice question yourself. Return, for every question index, the index (0-3) of the option you believe is correct.\n\n<material>\n${body}\n</material>`;
}
