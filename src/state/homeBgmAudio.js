/** 홈 BGM 전용 — 인스턴스 1개만 유지 (이중 재생 방지) */

let audio = null;

export function homeBgmTrackSrc(track) {
  return track === 'pixel' ? '/audio/bgm/BGM픽셀로파이st.mp3' : '/audio/bgm/BGM오두막st.mp3';
}

/**
 * 같은 트랙이면 false — 한글 파일명은 브라우저가 URL 인코딩해 pathname.endsWith 비교가 실패하고
 * 매번 a.src를 다시 넣어 재생이 처음부터 되는 문제가 있어, 절대 URL로만 비교한다.
 */
export function homeBgmSrcNeedsUpdate(a, src) {
  if (!a) return true;
  try {
    const target = new URL(src, window.location.href).href;
    const cur =
      a.currentSrc && a.currentSrc.length > 0
        ? a.currentSrc
        : a.src
          ? new URL(a.src, window.location.href).href
          : '';
    return cur !== target;
  } catch {
    return true;
  }
}

export function homeBgmGetAudio() {
  if (!audio) {
    audio = new Audio();
    audio.loop = true;
  }
  return audio;
}

export function homeBgmPause() {
  if (!audio) return;
  try {
    audio.pause();
  } catch {
    /* noop */
  }
}

/** 라우트 이탈 등: 완전히 멈춤 */
export function homeBgmStop() {
  homeBgmPause();
  if (!audio) return;
  try {
    audio.src = '';
    audio.removeAttribute('src');
    audio.load();
  } catch {
    /* noop */
  }
}
