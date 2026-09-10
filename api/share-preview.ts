import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mchikdltrcbovhdzdhhf.supabase.co',
  'sb_publishable_aITf5gAB5i-gLx_mcS2Z5w_99ov4D9u'
);

function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function domain(url: string): string {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
}

const BOT_UA = /bot|crawl|spider|facebookexternalhit|facebookcatalog|whatsapp|telegram|discord|slackbot|twitterbot|linkedinbot|pinterest|prerender|preview|iMessage|google|bing|yahoo|applebot/i;

// 단톡방에 보드를 보내면 예전엔 전부 같은 SaveBoard 광고 이미지가 떴다 — 받는 사람 눈에는
// 무엇이 담긴 보드인지 알 길이 없었다(2026-09-10 카카오톡 화면에서 확인).
// 이제 보드 안의 실제 카드 이미지를 미리보기로 쓴다. 고르는 순서:
//   1. 우리 스토리지(Supabase)에 있는 것 — 만료되지 않는다. 인스타·틱톡 썸네일은 저장 시
//      우리가 사본을 떠 두므로 대개 여기 해당한다.
//   2. 그 외 http(s) 이미지.
//   3. 하나도 없으면 기존 일반 이미지로 폴백.
// ⚠️ placeholder:* 는 URL 이 아니라 앱 내부 표식이라 반드시 걸러야 한다.
const OUR_STORAGE = 'mchikdltrcbovhdzdhhf.supabase.co';
// 유튜브 카드는 image 를 저장하지 않는다 — 앱이 영상 ID 로 그때그때 썸네일 주소를 만든다.
// 그래서 스냅샷만 보면 유튜브만 담긴 보드는 이미지가 하나도 없는 것처럼 보인다
// (2026-09-10 확인: 가이드 보드 3장이 전부 그랬다). 여기서도 같은 방식으로 만들어 준다.
function youTubeThumb(url: string): string | null {
  const m = url.match(/youtube\.com\/shorts\/([\w-]+)/)
    || url.match(/youtube\.com\/watch\?v=([\w-]+)/)
    || url.match(/youtu\.be\/([\w-]+)/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
}
function pickBoardImage(links: any[]): string | null {
  const usable = links.map(l => {
    const img = typeof l?.image === 'string' ? l.image : '';
    if (/^https?:\/\//i.test(img)) return img;
    return typeof l?.url === 'string' ? youTubeThumb(l.url) : null;
  }).filter((u): u is string => !!u);
  return usable.find(u => u.includes(OUR_STORAGE)) ?? usable[0] ?? null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = typeof req.query.token === 'string' ? req.query.token.trim() : '';
  if (!token) return res.redirect('/');

  // Real browsers → redirect to the React SPA (which re-enters via ?app=1 → index.html)
  const ua = String(req.headers['user-agent'] ?? '');
  if (!BOT_UA.test(ua)) {
    return res.redirect(302, `/share/${token}?app=1`);
  }

  let board: any = null;
  try {
    const { data } = await supabase
      .rpc('get_shared_board', { p_token: token })
      .single();
    board = data;
  } catch {
    // fall through to generic OG
  }

  const SITE = 'https://www.saveboard.app';
  const shareUrl = `${SITE}/share/${token}`;

  if (!board) {
    const html = `<!DOCTYPE html><html><head>
      <meta charset="UTF-8"/>
      <title>Board not found — SaveBoard</title>
      <meta property="og:title" content="SaveBoard — Save everything that matters"/>
      <meta property="og:description" content="Save links, articles, videos and notes — organised in beautiful boards."/>
      <meta property="og:image" content="${SITE}/og-image.png"/>
    </head><body>
      <script>window.location.replace('${SITE}');</script>
    </body></html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  }

  const ownerName = (board as any).owner_name
    || (board as any).owner_email?.split('@')[0]
    || 'Someone';
  const category  = (board as any).category  || 'Board';
  const links     = Array.isArray((board as any).links_snapshot) ? (board as any).links_snapshot : [];
  const count     = links.length;

  // Lead with the board name so it stays visible even when link-preview UIs
  // (iMessage, WhatsApp, etc.) truncate the title after ~1-2 lines.
  const ogTitle = `“${category}” · shared by ${ownerName} on SaveBoard`;
  // 보드 자신의 이미지가 있으면 그걸 쓴다. 크기 태그는 그때 붙이지 않는다 —
  // 카드 이미지의 실제 비율을 모르는데 1200x630 이라고 우기면 크롤러가 잘못 자른다.
  const boardImage = pickBoardImage(links as any[]);
  const ogImage = boardImage ?? `${SITE}/og-image.png`;
  const ogDesc  = `${ownerName} shared the “${category}” board with you — ${count} save${count !== 1 ? 's' : ''}, all in one place on SaveBoard.`;

  const linksHtml = (links as any[]).slice(0, 9).map(l => `
    <a href="${esc(l.url)}" class="card" target="_blank" rel="noopener noreferrer">
      ${l.image && l.image !== 'placeholder:memo' && l.image !== 'placeholder:pdf'
        ? `<div class="thumb"><img src="${esc(l.image)}" alt="" loading="lazy" onerror="this.parentElement.style.display='none'"/></div>`
        : ''}
      <div class="info">
        <p class="title">${esc(l.title)}</p>
        <p class="dom">${esc(domain(l.url))}</p>
      </div>
    </a>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${esc(ogTitle)}</title>
  <meta name="description" content="${esc(ogDesc)}"/>

  <meta property="og:type"         content="website"/>
  <meta property="og:url"          content="${esc(shareUrl)}"/>
  <meta property="og:title"        content="${esc(ogTitle)}"/>
  <meta property="og:description"  content="${esc(ogDesc)}"/>
  <meta property="og:image"        content="${esc(ogImage)}"/>
${boardImage ? '' : `  <meta property="og:image:width"  content="1200"/>
  <meta property="og:image:height" content="630"/>`}

  <meta name="twitter:card"        content="summary_large_image"/>
  <meta name="twitter:url"         content="${esc(shareUrl)}"/>
  <meta name="twitter:title"       content="${esc(ogTitle)}"/>
  <meta name="twitter:description" content="${esc(ogDesc)}"/>
  <meta name="twitter:image"       content="${esc(ogImage)}"/>

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #F8F7FF; color: #111; min-height: 100vh; }

    nav { position: sticky; top: 0; z-index: 10; background: rgba(248,247,255,.92); backdrop-filter: blur(12px); border-bottom: 1px solid #E5E3F0; padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; }
    .logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
    .logo-icon { width: 28px; height: 28px; border-radius: 8px; background: linear-gradient(135deg,#7C3AED,#6366F1); display: flex; align-items: center; justify-content: center; }
    .logo-icon svg { width: 14px; height: 14px; fill: none; stroke: #fff; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
    .logo-text { font-size: 14px; font-weight: 700; background: linear-gradient(90deg,#7C3AED,#6366F1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .get-btn { font-size: 12px; padding: 6px 14px; border-radius: 8px; font-weight: 600; color: #fff; background: linear-gradient(135deg,#7C3AED,#6366F1); text-decoration: none; white-space: nowrap; }

    .hero { max-width: 900px; margin: 0 auto; padding: 36px 20px 20px; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
    .hero-left {}
    .label { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: rgba(124,58,237,.5); margin-bottom: 6px; }
    h1 { font-size: 30px; font-weight: 800; color: #111; line-height: 1.1; }
    .meta { font-size: 13px; color: #888; margin-top: 6px; }
    .save-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 12px; font-size: 13px; font-weight: 600; color: #fff; background: linear-gradient(135deg,#7C3AED,#6366F1); text-decoration: none; white-space: nowrap; margin-top: 6px; }
    .save-btn svg { flex-shrink: 0; }

    .grid { max-width: 900px; margin: 0 auto; padding: 4px 20px 60px; display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
    .card { display: flex; flex-direction: column; gap: 10px; background: #fff; border: 1px solid #EDE9FE; border-radius: 16px; padding: 14px; text-decoration: none; color: inherit; transition: box-shadow .15s, border-color .15s; }
    .card:hover { box-shadow: 0 4px 20px rgba(124,58,237,.13); border-color: #C4B5FD; }
    .thumb { width: 100%; height: 140px; border-radius: 10px; overflow: hidden; flex-shrink: 0; }
    .thumb img { width: 100%; height: 100%; object-fit: cover; }
    .info { flex: 1; min-width: 0; }
    .title { font-size: 14px; font-weight: 600; color: #111; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4; }
    .dom { font-size: 11px; color: #bbb; margin-top: 5px; }

    .empty { max-width: 900px; margin: 0 auto; padding: 60px 20px; text-align: center; color: #aaa; font-size: 14px; }
  </style>
</head>
<body>
  <nav>
    <a class="logo" href="${SITE}">
      <div class="logo-icon">
        <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
      </div>
      <span class="logo-text">SaveBoard</span>
    </a>
    <a class="get-btn" href="${SITE}">Get SaveBoard</a>
  </nav>

  <div class="hero">
    <div class="hero-left">
      <p class="label">Shared Board</p>
      <h1>${esc(ownerName)} wants to share their ${esc(category)} Board with you</h1>
      <p class="meta">${count} save${count !== 1 ? 's' : ''} · curated by ${esc(ownerName)}</p>
    </div>
    <a class="save-btn" href="${SITE}">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
      Save this Board
    </a>
  </div>

  ${count === 0
    ? '<div class="empty">No saves in this board yet.</div>'
    : `<div class="grid">${linksHtml}</div>`
  }
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  return res.send(html);
}
