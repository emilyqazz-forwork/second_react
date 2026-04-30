const STORAGE_KEYS = {
  profile: "chickode:profile:v1",
  attempts: "chickode:attempts:v1",
};

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function getProfile() {
  const raw = localStorage.getItem(STORAGE_KEYS.profile);
  const profile = safeJsonParse(raw ?? "", null);
  if (profile && typeof profile === "object") return profile;
  return { name: "상우", createdAt: Date.now() };
}

export function setProfile(nextProfile) {
  localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(nextProfile));
}

export function getAttempts() {
  const raw = localStorage.getItem(STORAGE_KEYS.attempts);
  const list = safeJsonParse(raw ?? "", []);
  return Array.isArray(list) ? list : [];
}

export function addAttempt(attempt) {
  const next = getAttempts();
  next.unshift(attempt);
  localStorage.setItem(STORAGE_KEYS.attempts, JSON.stringify(next.slice(0, 500)));
}

export function clearAllData() {
  localStorage.removeItem(STORAGE_KEYS.profile);
  localStorage.removeItem(STORAGE_KEYS.attempts);
}

export function summarizeAttempts(attempts) {
  const total = attempts.length;
  const correct = attempts.filter((a) => a && a.isCorrect).length;
  const wrong = total - correct;

  const byChapter = {};
  const byType = {};
  for (const a of attempts) {
    if (!a) continue;
    const ch = String(a.chapter ?? "unknown");
    const ty = String(a.type ?? "unknown");
    byChapter[ch] = byChapter[ch] ?? { total: 0, correct: 0, wrong: 0 };
    byType[ty] = byType[ty] ?? { total: 0, correct: 0, wrong: 0 };
    byChapter[ch].total++;
    byType[ty].total++;
    if (a.isCorrect) {
      byChapter[ch].correct++;
      byType[ty].correct++;
    } else {
      byChapter[ch].wrong++;
      byType[ty].wrong++;
    }
  }

  return { total, correct, wrong, byChapter, byType };
}
