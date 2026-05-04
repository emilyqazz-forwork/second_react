//localStorage를 사용하여 사용자 프로필과 퀴즈/문제 풀이 시도 기록을 관리하는 데이터 관리 모듈

//데이터 저장 키
const STORAGE_KEYS = {
  profile: "chickode:profile:v1",
  attempts: "chickode:attempts:v1",
};

//에러발생방지 안전장치 
function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

//프로필관리
export function getProfile() {
  const raw = localStorage.getItem(STORAGE_KEYS.profile);
  const profile = safeJsonParse(raw ?? "", null);
  if (profile && typeof profile === "object") return profile;
  return { name: "게스트", createdAt: Date.now() };
}

export function setProfile(nextProfile) {
  localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(nextProfile));
}

//시도기록관리
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

//데이터 초기화
export function clearAllData() {
  localStorage.removeItem(STORAGE_KEYS.profile);
  localStorage.removeItem(STORAGE_KEYS.attempts);
}

/*데이터분석(전체통계:총 시도 횟수,정ㅇ답 수,오답수 계산,)
          그룹화통계:챕터별,문제 유형별 정답률 확인 */
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
