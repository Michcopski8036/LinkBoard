import { Capacitor } from '@capacitor/core';

export const PROD_URL = 'https://www.saveboard.app';

// Base URL for links we hand to OTHER people (share links, invite links).
// On native the web view runs from a local scheme — iOS is `capacitor://localhost`,
// Android is `http://localhost` — so `window.location.origin` there is not a real
// public URL. Sniffing only for `capacitor` misses Android; use the authoritative
// Capacitor check plus a localhost guard so shared links always point at prod.
export function publicBase(): string {
  try {
    if (Capacitor.isNativePlatform()) return PROD_URL;
  } catch { /* Capacitor not ready */ }
  if (typeof window === 'undefined') return PROD_URL;
  const o = window.location.origin;
  if (/localhost|127\.0\.0\.1|capacitor:|file:/i.test(o)) return PROD_URL;
  return o;
}

// True on the native iOS/Android app (any local scheme), false on the real web.
export function isNativeApp(): boolean {
  try {
    if (Capacitor.isNativePlatform()) return true;
  } catch { /* ignore */ }
  if (typeof window === 'undefined') return false;
  return /localhost|127\.0\.0\.1|capacitor:|file:/i.test(window.location.origin);
}

// 우리 서버리스 API 를 부를 주소. 네이티브에서는 페이지 오리진이 capacitor://localhost(iOS)
// · http://localhost(Android) 라서 상대경로 '/api/...' 는 **서버까지 가지 않는다** —
// 앱 번들 안에서 그 경로를 찾다가 실패한다. 그래서 네이티브에서는 절대주소를 쓴다.
// (BillingPage·boards.ts 가 이미 같은 방식을 손으로 쓰고 있었고, 나머지 호출부가 빠져 있었다.)
// ⚠️ 이걸 쓰는 라우트는 반드시 CORS 를 열어야 한다(Access-Control-Allow-Origin + OPTIONS 200).
//    안 열면 브라우저가 응답을 막고, 실패는 조용히 폴백으로 흘러간다.
export function apiUrl(path: string): string {
  return isNativeApp() ? `${PROD_URL}${path}` : path;
}
