# Changelog

All notable changes to ryoko-kakeibo (旅行家計簿).

Format loosely follows [Keep a Changelog](https://keepachangelog.com/), with PTDO (Problem / Trade-off / Decision / Outcome) blocks for non-trivial architectural decisions.

---

## v1.1

### Added

- **Zoom lock**: iOS Safari pinch and double-tap zoom are now blocked via `viewport meta` + JS `preventDefault` on `gesturestart` / `gesturechange` / multi-touch `touchstart` / sub-300ms `touchend`. CSS `touch-action: pan-x pan-y` on body.
- **First-visit onboarding**: 50% black overlay with hand-drawn SVG arrows pointing to three core gestures — `◀▶ 切換日期` (top), `左滑 → 刪除` (mid), `↑ 上滑記帳` (bottom). Hints are dynamically aligned to actual UI element positions via `getBoundingClientRect()`, working across all device heights. Tap anywhere to dismiss; `localStorage.tabicho-onboarded=true` prevents repeat.
- **Last-date persistence**: `localStorage.tabicho-last-date` written on each `changeDay()`. First visit defaults to Day 1 (`TRIP.start`); subsequent visits restore last location.
- **Storage conflict detection**: on `visibilitychange → visible`, re-reads localStorage and compares fingerprint `length-totalAmount-latestUpdatedAt`. On mismatch, shows toast with two actions: `使用新版` (primary, adopts remote) / `保留目前` (writes memory back to storage).
- **PWA update detection**: when Netlify deploys a new version, the service worker detects the change in background and displays a fixed top banner `有新版本可用 [更新]`. Tapping `更新` sends `SKIP_WAITING` to the new SW, triggers `controllerchange`, and auto-reloads. User data is preserved (localStorage is untouched).
- **Multi-action toast**: `showToast(msg, { actions: [...] })` now supports an array of action buttons, with `.primary` style for emphasized actions. Backward-compatible with single `action` option.

### Changed

- **Favicon**: redesigned from solid 朱色 shopping-bag to half-opened 家計簿 spread.
  - Left page lifting (mid-flip), right page flat with mock 直書日文 + amount column lines + 酒紅 `#722F37` seal
  - Real calligraphy brush (梭形 brush tip tapering to point + 竹節 bamboo-segment handle + 朱穗 red tassel)
- **Version tag visible**: bottom-right corner shows `v1.1`, also in Settings → 關於. Eliminates "did I download the new version?" ambiguity.
- **Service Worker cache versioning**: `CACHE_NAME` includes version string (`ryoko-kakeibo-v1.1`). Each deploy with a bumped version auto-clears stale caches on activation.

### PTDO — Conflict resolution UX

**P:** When the same app is opened on two devices (or two tabs), storage diverges silently. Last-write-wins overwrites the user's intent.

**T:**
- Auto-merge: complex, requires record-level conflict resolution.
- Always reload on focus: loses unsaved work in the active tab.
- Prompt: interrupts user but preserves agency.

**D:** Hash-based detection on `visibilitychange`. Fingerprint = `records.length + totalAmount + latestUpdatedAt`. On mismatch, toast with two named buttons.

**O:** Lightweight (10 lines of code), respects user intent in both directions. Hash collisions are theoretically possible but practically negligible — would need same length + same total + same latest timestamp.

### PTDO — PWA update strategy

**P:** Safari aggressively caches PWA assets. After Add-to-Home-Screen, even when a new version is deployed, users continue seeing the old version until manually clearing cache. Previous local data is preserved (good), but new features never appear (bad).

**T:**
- Aggressive auto-update on every visit: silent but risks interrupting in-progress input.
- Disable all caching (`no-cache` meta): defeats PWA offline support.
- Status-quo (do nothing): users miss updates indefinitely.
- Detect + prompt: user sees a banner when new version is ready, decides when to apply.

**D:** Versioned `CACHE_NAME` + `updatefound` listener + visible top banner with `更新` button. Tapping triggers `SKIP_WAITING` message → new SW activates → `controllerchange` fires → page auto-reloads. localStorage data persists across the reload.

**O:** Updates land reliably without forcing interruption mid-task. User retains agency (can keep using old version until convenient). Cost: ~20 lines of registration code + simple banner UI. Requires version bump in `service-worker.js` `CACHE_NAME` on each deploy (manual step, but enforced by the version in CHANGELOG).

---

## v1.0

First public deploy. 京阪 trip ready.

### Added

- **Main view**: Hero (amount left-aligned + NT$ + Total on right) + Day bar (◀ Day N · date ▶ + 1-line tip) + scrollable record list + bottom CTA
- **Quick-add modal**: amount input + item / route + category picker (5) + payment picker (3) + note
- **Edit modal**: same UI, prefilled, footer becomes 刪除 / 取消 / 儲存
- **Expression parser**: shunting-yard implementation supporting `+ − × ÷ ( )` and 全形 `× ÷`. Live preview while typing, commits to result on blur (e.g. `1500+800` → `2300`).
- **Transport mode**: selecting 🚃 swaps item input for dual route fields with auto-formatted preview (`京都 → 大阪 車資`).
- **Category-aware item label**: itemRow label syncs with selected category (餐飲 → 「餐　飲」, 門票 → 「門　票」, etc.). Transport switches to a separate route row.
- **Trip-wide Total**: hero shows daily amount + cross-trip total. Total stays constant regardless of which day is viewed.
- **Swipe-to-delete**: left-swipe record → reveal red delete button → tap → 5s undo toast.
- **Day navigation**: ◀/▶ buttons + horizontal swipe on day bar. Disabled state at trip boundaries (opacity 0.3 for high contrast).
- **Theme**: light / dark / auto via Settings segmented control. iOS status bar color synced via dynamic `theme-color` meta override.
- **v6 → v5 migration**: on first load, checks for legacy `hou_keihan_2026_shopping` key and converts `categories.items[].done` (shopping) + `expenses[]` (food/transport/ticket/other) into v5 records. Smart-guess date when v6 entry has none (uses trip midpoint).
- **JSON export / import**: download as `tabicho-京阪-YYYY-MM-DD.json`, import via file picker with confirmation.
- **Cross-device share code**: base64-encoded `TABICHO5:...` string, copy / paste between devices.
- **Settings page**: full-screen slide-up with theme / trip info / data actions / about.
- **Data clear option**: settings → 清除全部資料 with double confirmation.

### Tech stack

- Single HTML file, all CSS + JS inline (~54 KB)
- `localStorage` for persistence (keys: `travel-log-v5`, `tabicho-theme`, `hou_keihan_2026_shopping` legacy)
- Service Worker for offline cache (network-first for same-origin, cache-first for cross-origin fonts)
- Shippori Mincho B1 from Google Fonts

### PTDO — Modal show/hide mechanism

**P:** Initial `visibility / opacity / pointer-events` triplet failed silently on iOS Safari — clicks didn't trigger and the sheet never animated in. Hard to diagnose without device debugger.

**T:**
- `visibility/opacity/pointer-events`: animatable but iOS Safari has timing issues.
- `display: none ↔ flex` with class toggle: 100% reliable, no animation.
- `display: flex` always + `transform: translateY(100%)` controlled by `data-open` attribute: reliable + animatable.

**D:** Chose the third option. Sheet is permanently `display: flex` but offscreen via `transform: translateY(100%)`. Adding `data-open="true"` triggers CSS `@keyframes slideUp` animation and brings sheet into view.

**O:** Worked on first try across Mac Safari, Mac Chrome, iOS Safari, iOS Chrome. Sacrificed the configurable cubic-bezier transition for keyframes simplicity — animation timing is locked at 0.3s but acceptable.

### PTDO — External config dependency

**P:** Original design used `<script src="trip.config.js">` to load `TRIP` config. When user opened `index.html` directly via `file://`, the fetch failed silently and `TRIP` was `undefined`. Later code referencing `TRIP.name` threw, aborting `init()` mid-way — every subsequent `addEventListener` was skipped, making the app appear "dead" with no errors visible to non-technical users.

**T:**
- Keep external file (clean separation, easy to swap for different trips) — but fragile.
- Inline only — robust but loses per-trip portability.
- Both — inline as fallback, external override if present.

**D:** Inlined `window.TRIP = {...}` directly in `index.html`. Kept `<script src="trip.config.js">` afterward as optional override; if file is missing the browser logs an info message and the inline default is used.

**O:** App works in any environment. To customize for a different trip, users can either edit `index.html` directly or place a `trip.config.js` alongside it.

### PTDO — Event binding strategy

**P:** Modern `addEventListener` is preferred for cleanup support, but if any earlier init step throws, all subsequent listener attachments are skipped — visible symptom is "buttons do nothing." Hard to diagnose remotely.

**T:**
- `addEventListener` everywhere: idiomatic, cleanup-friendly, but cascade-failure prone.
- `onclick` attribute in HTML: less idiomatic but guaranteed to fire even if init fails.
- Hybrid: `onclick` on critical entry points, `addEventListener` for internal logic.

**D:** Switched all top-level user-facing buttons (settings, day arrows, CTA, theme picker, settings list items) to `<button>` element + `onclick="funcName()"` attribute. Listeners attached after init only for internal mechanics (touch swipe, input, blur).

**O:** Top-level UI always responsive regardless of init state. Trade-off: can't easily remove these listeners, but that's not needed for this app's lifetime.
