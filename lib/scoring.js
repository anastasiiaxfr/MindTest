import { iq, memory, mental } from './tests.js';

export function score(test, answers) {
  const questions = { iq, memory, 'mental-age': mental }[test];
  if (!Array.isArray(questions) || !Array.isArray(answers) || answers.length !== questions.length) return null;
  const isAge = test === 'mental-age';
  if (answers.some(a => !Number.isInteger(a) || a < 0 || a >= (isAge ? 5 : 4))) return null;
  const groups = {};
  let total = 0;
  for (const [i, question] of questions.entries()) {
    const name = question[isAge ? 2 : 3];
    const value = isAge ? answers[i] : Number(answers[i] === question[2]);
    const group = groups[name] ??= { value: 0, max: 0 };
    group.value += value;
    group.max += isAge ? 4 : 1;
    total += value;
  }
  return {
    score: isAge ? 16 + Math.round(49 * total / 24) : Math.round(100 * total / questions.length),
    unit: isAge ? 'years' : '%',
    groups: Object.entries(groups).map(([label, g]) => ({ label, percent: Math.round(100 * g.value / g.max) }))
  };
}
