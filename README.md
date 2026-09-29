# Dek-D Novel Reader - Interactive Front-end Developer Take-Home Quiz

An enterprise-grade, accessible, and high-performance Novel Reader and Bookmarks web application designed for the **Dek-D Interactive Front-end Developer Intern (January 2027 intake)** technical assessment.

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Zod**, and **Vitest**.

---

## 🌟 Core Feature Overview

### 1. Promotional Novel Banner Carousel (Top Hero)
- **Visual Design:** Centered active novel banner with left and right peeking cards matching the official Figma layout.
- **Accessibility & Motion (WCAG 2.2.2):** Explicit **Play / Pause button** for screen reader users and keyboard accessibility. Auto-rotation pauses automatically on mouse hover, keyboard focus, and when the user enables `prefers-reduced-motion`.
- **Performance (LCP):** First banner slide marked with Next.js Image `priority` and `fetchPriority="high"`, server-rendered in the initial HTML to anchor Largest Contentful Paint under 1.2s.
- **Zero-Clone Architecture:** Avoids DOM clones entirely to prevent React 18 `inert` warnings, using index wrapping with modulo arithmetic and CSS `touch-action: pan-y` for unimpeded mobile vertical scrolling.

### 2. Novel Bookmark Management (CRUD & Bulk Actions)
- **Section Header:** Bold Thai title `"รายการที่คั่นไว้"` with full-width subtle divider matching Figma.
- **Controls Sub-bar:**
  - Left: Dynamic counter `"จำนวนทั้งหมด {n} รายการ"`. When searched or filtered by category/status, dynamically transitions to `"แสดง {filtered} จาก {total} รายการ"`.
  - Right: Pill button `"แก้ไข"` (Edit) / `"เสร็จสิ้น"` (Done), plus `"เพิ่มที่คั่น"` (Add Bookmark).
- **Novel Card Design (Pixel-Perfect Figma Match):**
  - Left: Vertical cover container with fixed `aspect-[2/3]` ratio and graceful fallback placeholder on error.
  - Right:
    - Bold novel title clamped to 2 lines with `leading-relaxed` (≥ 1.5) and `min-h-[3rem]` (48px) to prevent vertical clipping of Thai tone marks (วรรณยุกต์) and multi-level vowels.
    - Author name in muted gray.
    - Current chapter badge with list icon (`ตอนที่ 18: ชายารองแห่งจวนอ๋อง`).
    - Bookmark time with bookmark icon (`คั่นล่าสุด 9 ก.ค. 63 / 22.56 น.` formatted with exact dot separator and Thai 'น.').
- **Interactive Stretched-Link Pattern:** Primary card click is handled via an `absolute inset-0` button, while checkboxes and the `+1 ตอน` button reside at `relative z-10`. Zero invalid nested `<button>` markup.
- **Quick "+1 ตอน" Button:** Allows readers to increment reading progress in 1 click with a 5-second **Undo Toast notification** that restores both chapter progress and the previous bookmark timestamp. Rapid clicks coalesce per novel ID.
- **Bulk Edit Mode:** Checkboxes appear on each novel card with a `"เลือกทั้งหมด"` (Select All) toggle. Bulk delete confirms via an accessible modal and operates strictly on the filtered visible subset.

### 3. Advanced Reader Features & Internationalization
- **Theme Switcher (Dark / Light Mode):**
  - Light mode: Clean Dek-D orange (`#f96519`) and green (`#8bc321`) aesthetic.
  - Dark mode: Deep slate surfaces (`#0b0f19` / `#111827`) with glowing orange accents designed for night readers.
  - Zero FOUC: Inline blocking script in `<head>` setting `class="dark"` from `localStorage` before the first paint.
- **Thai / English i18n Switcher:** Toggle between Thai (`TH`) and English (`EN`) in the top navigation bar, updating all labels, status chips, modal forms, and date formatting.
- **Live Search & Category Filtering:** Search box with debounced matching, NFC normalization, control character stripping, and regex ReDoS escaping. Category tabs (All, Fantasy, Romance, Action, Martial Arts, Teen) and Reading Status chips (Reading, Completed, On Hold).
- **Data Export & Import:** Export bookmarks to a versioned JSON envelope (`{ version: 1, items: [...] }`). Import JSON with per-item Zod validation, reporting successful rows and skipping invalid ones, with a choice between "Replace" and "Merge".
- **Keyboard Shortcuts (Thai-Layout Proof):**
  - `/` Focus search input.
  - `e` Toggle bulk edit mode.
  - `n` Open add bookmark modal.
  - `?` Open keyboard shortcuts cheat sheet.
  - `Esc` Close any open modal dialog.
  - Built with `e.code` (`KeyE`, `Slash`) to prevent failure on Thai keyboard layouts where physical keys produce Thai letters (`ำ`, `ฝ`). Automatically suppressed inside inputs, textareas, IME composition, and open dialogs. Includes a WCAG 2.1.4 toggle to disable single-key shortcuts.

---

## 🏛️ Architectural Decisions & Zero-Hole Mitigations

| Challenge / Pitfall | Root Cause | Enterprise Mitigation |
| :--- | :--- | :--- |
| **Storage Re-render Loop** | Deriving state by calling `JSON.parse` inside `getSnapshot` triggers a new array reference every render | Used **In-Memory Store as Single Source of Truth** (`bookmarksStore`). UI updates synchronously in 0ms; `localStorage` is an asynchronous persistence sink flushed on `visibilitychange` and `pagehide`. |
| **SSR Hydration Mismatch** | Rendering empty array `[]` on SSR flashes false empty states before client storage hydrates | `getServerSnapshot` returns a strict `null` sentinel. The UI renders exact-dimension skeleton cards until client hydration completes. |
| **Thai Tone Mark Clipping** | Default line-height cuts off Thai upper/lower vowel glyphs inside `line-clamp-2` containers | Title line-height set to `leading-relaxed` (1.625) and `min-h-[3rem]` (48px) with `break-words` and `<html lang="th">`. |
| **Buddhist Era Formatting** | Standard `Intl` formats time with colons (`22:56`), but Figma specifies dot format (`22.56 น.`) | Pinned `Intl.DateTimeFormat('th-TH-u-ca-buddhist', { timeZone: 'Asia/Bangkok' }).formatToParts()` to assemble `{day} {month} {yy} / {HH}.{mm} น.`. |
| **Thai Keyboard Failures** | `e.key` yields Thai characters (e.g. `ำ` for `e`, `ฝ` for `/`), causing single-key shortcuts to fail | Matched on physical `e.code` (`KeyE`, `Slash`), with IME `isComposing` and input focus suppression. |
| **Multi-Tab Clobbering** | Multiple open tabs can overwrite each other's debounced writes | Subscribed to `window.addEventListener('storage', ...)` to re-read and notify subscribers across tabs. |
| **Prototype Pollution & ReDoS** | Malicious JSON imports containing `__proto__` or catastrophic regex | Strict Zod validation with `z.preprocess()` checking object prototypes, and `sanitizeSearchRegex()` escaping query strings. |
| **Content Security Policy** | Strict CSP blocks inline theme script and Next.js hydration scripts | Configured CSP in `next.config.mjs` allowing `'unsafe-inline'` for script-src with documented architectural rationale. |

---

## 📁 Project Structure

```
dekd_frontend_quiz/
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout: Noto Sans Thai, ThemeProvider, ToastProvider
│   │   ├── page.tsx                 # Dashboard: Navbar, BannerCarousel, BookmarkList, Modals
│   │   └── globals.css              # Theme CSS variables, dark mode, custom scrollbars
│   ├── components/
│   │   ├── Navbar.tsx               # Dek-D logo, search, language toggle, theme toggle, shortcuts
│   │   ├── BannerCarousel.tsx       # Center-peeking carousel with WCAG Play/Pause and touch-action
│   │   ├── BookmarkCard.tsx         # Aspect-[2/3] cover, title clamp, list icon, quick +1 button
│   │   ├── BookmarkList.tsx         # Header, count, edit mode, category tabs, 3-column grid
│   │   ├── BookmarkModal.tsx        # Add / Edit native <dialog> with Zod validation and JSON import/export
│   │   ├── BulkDeleteModal.tsx      # Native <dialog> with cancel default focus and exact count
│   │   ├── KeyboardCheatSheet.tsx   # Modal cheat sheet with WCAG 2.1.4 single-key shortcut toggle
│   │   ├── SkeletonCard.tsx         # Zero-CLS skeleton matching exact dimensions
│   │   └── ToastContainer.tsx       # Permanent aria-live container with hover-pause and Undo action
│   ├── context/
│   │   ├── ThemeContext.tsx         # Light / Dark theme state and zero-FOUC inline head script
│   │   └── I18nContext.tsx          # Complete Thai and English dictionary and hook
│   ├── hooks/
│   │   ├── useBookmarks.ts          # In-memory store, useSyncExternalStore, multi-tab sync, undo
│   │   ├── useDebounce.ts           # Debounced search and storage write utilities
│   │   └── useKeyboardShortcuts.ts  # Code-based shortcut listener with IME and input suppression
│   ├── types/
│   │   └── novel.ts                 # TypeScript types and Zod schemas with prototype pollution guards
│   ├── data/
│   │   └── mockNovels.ts            # High-fidelity mock bookmarks with valid v4 UUIDs and ISO UTC dates
│   └── lib/
│       ├── formatters.ts            # Pinned Buddhist Era and Gregorian date formatters
│       ├── sanitize.ts              # NFC normalization, control character stripping, ReDoS escape
│       └── uuid.ts                  # Secure UUID generator with crypto.getRandomValues fallback
├── tests/
│   ├── setup.ts                     # JSDOM stubs: matchMedia, IntersectionObserver, showModal
│   ├── bookmarks.schema.test.ts     # Zod schema validation boundaries and prototype pollution tests
│   ├── useBookmarks.test.ts         # CRUD, bulk delete, per-novel undo, and corrupted recovery tests
│   ├── formatters.test.ts           # Exact Buddhist Era format output tests
│   └── BannerCarousel.test.tsx      # Carousel navigation and WCAG 2.2.2 Play/Pause controls tests
├── next.config.mjs                  # CSP, HSTS, security headers, poweredByHeader: false
├── tailwind.config.ts               # darkMode: 'class', Dek-D brand palette, custom aspect ratios
├── vitest.config.mts                # React plugin, @/* path alias, jsdom test environment
└── tsconfig.json
```

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Automated Test Suite (Vitest)
```bash
npm test
```
Runs all 27 unit and integration tests across schemas, formatters, store operations, and components.

### 4. Production Build Verification
```bash
npm run build
npm start
```

---

## 🔒 Security & Known Trade-offs
1. **Remote Images:** User-provided image URLs inevitably expose the viewer's client IP address to the third-party image host even with `referrerPolicy="no-referrer"`. In production, this can be mitigated by routing user-submitted images through an internal image proxy or Cloudflare Images.
2. **CSP Configuration:** `'unsafe-inline'` is permitted for `script-src` to enable the zero-FOUC inline theme script in `<head>` and Next.js hydration scripts without requiring server-side nonces on static pages.
