# ryoko-kakeibo (旅行家計簿)

A single-file vintage-Japanese-style PWA for travel expense tracking. Originally built for a 2026 京阪 (Kyoto–Osaka) 7-day trip.

> 旅行家計簿 — like a paper kakeibo (家計簿, traditional Japanese household ledger), but it lives in your phone's home screen.

![icon](icons/icon-192.png)

---

## What it does

- **Daily expense tracking** by category (餐飲 / 交通 / 門票 / 採購 / 其他) and payment (現金 / 刷卡 / IC 卡)
- **Expression parser** in amount field — `1500+800` → `2300`, supports `+ − × ÷ ( )` and 全形 `× ÷`
- **Transport mode** with dual route input (起點 → 終點) auto-formats item text
- **Daily breakdown + Trip Total** in hero
- **Swipe-to-delete** with 5-second undo
- **Day navigation** via ◀/▶ buttons or horizontal swipe
- **Light / Dark / Auto** theme with iOS status-bar sync
- **v6 → v5 migration** (auto-imports existing shopping list data if present)
- **JSON export / import** + cross-device base64 share code
- **Storage conflict detection** when tab regains focus
- **First-visit onboarding** with hand-drawn arrows

---

## Tech

- Vanilla HTML / CSS / JS — no framework, no build step
- `localStorage` for persistence
- Service Worker for offline cache (when served over https)
- Shippori Mincho B1 from Google Fonts for headings

Single `index.html` contains all CSS + JS inline. Total ~54 KB.

---

## File layout

```
ryoko-kakeibo/
├── README.md           ← you are here
├── CHANGELOG.md        ← version history + key decisions
├── .gitignore
├── index.html          ← main app (self-contained)
├── trip.config.js      ← optional external override (TRIP)
├── manifest.json       ← PWA manifest
├── service-worker.js   ← offline cache (network-first, cache fallback)
└── icons/
    ├── favicon.svg
    ├── icon-180.png    ← Apple touch icon
    ├── icon-192.png    ← PWA standard
    └── icon-512.png    ← PWA high-res
```

---

## Deploy

**Option A — Netlify (currently in use, drag-drop):**
1. Drag the whole `ryoko-kakeibo/` folder to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Copy the issued `https://*.netlify.app` URL
3. Open in iOS Safari → Share → Add to Home Screen

**Option B — Netlify + GitHub (recommended for continuous deploy):**
1. Push this repo to GitHub
2. Netlify → "Add new site" → "Import an existing project" → GitHub → select repo
3. Build settings: leave build command empty, publish directory = `/` (root)
4. Subsequent `git push` to `main` triggers auto-deploy

**Option C — Any static host:**
GitHub Pages, Cloudflare Pages, Vercel static, S3 — all work. No build step required.

**Local preview:**
Open `index.html` directly in a browser. Everything except PWA install + service worker works on `file://`.

---

## Customize for a different trip

Edit `trip.config.js`:

```js
window.TRIP = {
  name: '京阪の記帳',           // shown in Settings → 旅程
  short: '京阪',                // used in export filename
  start: '2026-05-23',          // ISO date
  end: '2026-05-29',
  currency: { code: 'JPY', symbol: '¥' },
  homeCurrency: { code: 'TWD', symbol: 'NT$' },
  rate: 0.20,                   // 1 JPY = 0.20 TWD
  dailyTips: {                  // optional per-day hint shown under day title
    '2026-05-23': '抵達日 — 出發京都',
    // ...
  }
};
```

The same `TRIP` is also inlined at the top of `index.html` as a fallback, so the app works even if `trip.config.js` is missing.

---

## Version

**v1.1** — see [CHANGELOG.md](./CHANGELOG.md) for full version history and architectural decisions.

Version tag is shown in bottom-right corner and Settings → 關於 so you can verify which version is loaded.

---

## Known limits

- Trip date range is bounded by `TRIP.start` / `TRIP.end` — records outside that window are kept but not summed into Total
- `record.amount` overflows the 46px Mincho hero font around 7 digits (¥ 9,999,999+)
- Service Worker only activates over https; on `file://` it silently skips
- iOS Safari < 14.5 ignores `inset: 0` and `100dvh` — would need polyfill if targeting older devices
- Cross-device share code uses base64 of JSON; very large datasets (200+ records) produce long strings — JSON export/import is more robust for backup

---

## Credits

- Typography: [Shippori Mincho B1](https://fonts.google.com/specimen/Shippori+Mincho+B1) by FONTDASU
- Design references: vintage Japanese 家計簿 (kakeibo) household ledgers, 旅之友 1936
