
export function calculatePriority(issue) {
  const severity = Number(issue.severity ?? 0);
  const impact = Number(issue.impact ?? 0);
  const recurrence = Number(issue.recurrence ?? 0);
  const timeUnresolved = Number(issue.timeUnresolved ?? 0);

  const score =
    severity * 0.40 +
    impact * 0.25 +
    recurrence * 0.20 +
    timeUnresolved * 0.15;

  return Number(
    Math.min(100, Math.max(0, score)).toFixed(2)
  );
}

export function getPriorityLevel(score) {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}
