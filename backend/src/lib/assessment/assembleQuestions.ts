import type { Question } from "@prisma/client";

// Fisher-Yates, in place.
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Plain random sample, no domain balancing — used for practice/graded/self-generated, where the
// caller has already scoped the eligible pool to what they want (a course, a skill, etc).
export function randomSample(eligible: Question[], count: number): Question[] {
  return shuffle(eligible.slice()).slice(0, count);
}

// Round-robins across whatever distinct `domain` values are present in the eligible pool, so a
// diagnostic test doesn't accidentally return mostly-one-domain just because that domain happens
// to have the most questions in the bank. Best-effort: if one domain runs out of questions before
// the target count is reached, the remaining slots are filled from whatever domains still have
// questions left, in round-robin order.
export function balancedDomainSample(eligible: Question[], count: number): Question[] {
  const byDomain = new Map<string, Question[]>();
  for (const q of eligible) {
    const bucket = byDomain.get(q.domain);
    if (bucket) bucket.push(q);
    else byDomain.set(q.domain, [q]);
  }
  const domains = shuffle([...byDomain.keys()]);
  for (const domain of domains) shuffle(byDomain.get(domain)!);

  const result: Question[] = [];
  let remainingDomains = domains.filter((d) => byDomain.get(d)!.length > 0);
  let i = 0;
  while (result.length < count && remainingDomains.length > 0) {
    const domain = remainingDomains[i % remainingDomains.length];
    const pool = byDomain.get(domain)!;
    result.push(pool.shift()!);
    if (pool.length === 0) {
      remainingDomains = remainingDomains.filter((d) => d !== domain);
    } else {
      i++;
    }
  }
  return result;
}
