# Dek-D Web Novel Reader & Community Platform

An enterprise-grade, accessible, and high-performance Web Novel Reader and Bookmarks platform designed for the **Dek-D Front-end Developer Take-Home Technical Assessment**.

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Zod**, and **Vitest**.

---

## 🌟 Core Feature Overview & Acceptance Criteria Alignment

### 1. Promotional Novel Banner Carousel (Section 1)
- **Figma Design Alignment:** Centered active novel banner with left and right peeking cards.
- **Accessibility & Motion (WCAG 2.2.2):** Explicit Play and Pause button for screen readers and keyboard users. Auto-rotation pauses automatically on mouse hover, keyboard focus, and when the user enables `prefers-reduced-motion`.
- **Performance (LCP):** First banner slide marked with Next.js Image `priority` and `fetchPriority="high"`, server-rendered in the initial HTML to anchor Largest Contentful Paint under 1.2s.
- **Zero-Clone Architecture:** Avoids DOM clones entirely to prevent React 18 `inert` warnings, using index wrapping with modulo arithmetic and CSS `touch-action: pan-y` for unimpeded mobile vertical scrolling.

### 2. Cover-First Novel Bookmarks (Section 2)
- **Section Header:** Bold Thai title `"รายการที่คั่นไว้"` with full-width subtle divider matching Figma.
- **Quick Resume Bar:** Automatically detects the most recently read novel from storage and renders a prominent 1-tap **"อ่านต่อทันที"** banner with live chapter progress.
- **Real-Time Counters:** Category filter tabs and reading status chips display live counts (e.g. `ทั้งหมด (18)`, `แฟนตาซี (4)`, `กำลังอ่าน (15)`).
- **Cover-First Poster Design:**
  - High-visibility vertical cover artwork (`aspect-[2/3]`).
  - Top-left glassmorphic category badge.
  - Top-right Quick Delete button with confirmation modal (or multi-select checkbox in bulk edit mode).
  - Ambient reading progress bar and chapter indicator embedded along the bottom edge of the artwork.
  - Clean card metadata: 2-line clamped title, author link, and Buddhist Era bookmark timestamp (`9 ก.ค. 63 / 22.56 น.`).
  - Full-width call-to-action button: `อ่านต่อ ตอนที่ {n}`.
- **Dynamic 2 to 5 Column Scaling:**
  - Mobile (<640px): 2 columns.
  - Tablet (640-1024px): 3 columns.
  - Desktop (1024-1536px): 4 columns.
  - Ultrawide (≥1536px): 5 columns.
- **Bulk Edit Mode:** Checkbox selection with "Select All" toggle and modal confirmation.

### 3. Latest Novel Updates & Community Leaderboard (Section 3)
- **Cover-First Discovery Grid:** 2 to 4 responsive columns showcasing fresh novel updates with category tags, floating 1-click bookmark actions, and direct chapter links.
- **Author Works Filtering:** Tap any creator name to filter the catalog to works by that author, with an active filter badge and reset button.
- **Community Top 10 Leaderboard:** Real-time ranking with tabs for Weekly, Monthly, and All-Time popular novels.

### 4. Dedicated Novel Reader Route (`/read/[novelId]/[chapter]`)
- **Novel Hero Banner:** Displays cover, title, author, category, total chapters, and reading status.
- **Automatic Reading Progress Sync:** Reading a chapter automatically updates the bookmark's `currentChapter` and `lastReadAt` in storage.
- **Reader Controls:** Configurable font sizes, font families (Noto Sans Thai, Sarabun, Charm), line width measures, and reading themes (Light, Sepia, Night, Dark).
- **Chapter Comments:** Interactive discussion thread with comment submission, like counters, and local persistence.

### 5. Universal System Features
- **Theme Switcher (Dark & Light Mode):** Zero-FOUC blocking script in `<head>` setting theme before first paint.
- **Thai & English i18n Switcher:** Instant locale toggle in the navbar with complete dictionaries.
- **Keyboard Shortcuts (Thai-Layout Safe):**
  - `/` Focus search input.
  - `e` Toggle bulk edit mode.
  - `n` Open add bookmark modal.
  - `?` Open keyboard shortcuts cheat sheet.
  - `Esc` Close any open modal dialog.
  - Evaluated on physical `e.code` (`KeyE`, `Slash`) to function seamlessly on Thai keyboard layouts.

---

## 🏛️ Architecture & Reliability

| Area | Challenge | Implementation Solution |
| :--- | :--- | :--- |
| **Storage Re-render Loop** | Deriving state with `JSON.parse` inside `getSnapshot` triggers a new array reference every render | In-Memory Store as Single Source of Truth (`bookmarksStore`). UI updates synchronously in 0ms; `localStorage` is an asynchronous persistence sink flushed on `visibilitychange` and `pagehide`. |
| **SSR Hydration Mismatch** | Rendering empty array `[]` on SSR flashes false empty states before client storage hydrates | `getServerSnapshot` returns a strict `null` sentinel. The UI renders exact-dimension skeleton cards until client hydration completes. |
| **Thai Tone Mark Clipping** | Default line-height cuts off Thai upper/lower vowel glyphs inside `line-clamp-2` containers | Title line-height set to `leading-relaxed` (1.625) and `min-h-[3rem]` (48px) with `break-words` and `<html lang="th">`. |
| **Buddhist Era Formatting** | Standard `Intl` formats time with colons (`22:56`), but Figma specifies dot format (`22.56 น.`) | Pinned `Intl.DateTimeFormat('th-TH-u-ca-buddhist', { timeZone: 'Asia/Bangkok' }).formatToParts()` to assemble `{day} {month} {yy} / {HH}.{mm} น.`. |
| **Prototype Pollution & ReDoS** | Malicious JSON imports containing `__proto__` or catastrophic regex | Strict Zod validation with `z.preprocess()` checking object prototypes, and `sanitizeSearchRegex()` escaping query strings. |
| **Security Headers** | Vulnerability to clickjacking, MIME sniffing, and cross-site leaks | Configured CSP, HSTS, `X-Content-Type-Options: nosniff`, and `X-Frame-Options: DENY` in `next.config.mjs`. |

---

## 📁 Project Structure

```
dekd_frontend_quiz/
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # Root layout: Noto Sans Thai, ThemeProvider
│   │   ├── page.tsx                     # Dashboard: Navbar, BannerCarousel, BookmarkList, Section 3
│   │   ├── read/[novelId]/[chapter]/    # Dedicated reader route with Hero banner & chapter viewer
│   │   └── globals.css                  # Theme CSS variables, dark mode, custom scrollbars
│   ├── components/
│   │   ├── Navbar.tsx                   # Logo, search, language toggle, theme toggle, shortcuts
│   │   ├── BannerCarousel.tsx           # Center-peeking carousel with WCAG Play/Pause controls
│   │   ├── BookmarkCard.tsx             # Cover-First vertical card, ambient progress bar, quick delete
│   │   ├── BookmarkList.tsx             # Section 2: Quick Resume bar, live counts, 2-5 responsive grid
│   │   ├── BookmarkModal.tsx            # Add bookmark dialog with Zod validation
│   │   ├── BulkDeleteModal.tsx          # Accessible bulk deletion modal
│   │   ├── SingleDeleteModal.tsx        # Single delete confirmation modal
│   │   ├── LatestUpdatesFeed.tsx        # Section 3: Cover-First updates feed and creator filter
│   │   ├── TopFollowedLeaderboard.tsx   # Top 10 novel rankings with period tabs
│   │   ├── ReaderToolbar.tsx            # Reader navigation, typography, and theme preferences
│   │   ├── ChapterComments.tsx          # Community discussion thread for reader route
│   │   ├── SkeletonCard.tsx             # Zero-CLS skeletons matching 2-5 grid layout
│   │   └── KeyboardCheatSheet.tsx       # Keyboard shortcuts cheat sheet modal
│   ├── context/
│   │   ├── ThemeContext.tsx             # Dark and light theme provider with zero-FOUC script
│   │   ├── I18nContext.tsx              # Thai and English internationalization context
│   │   └── BookmarkContext.tsx          # Unified bookmark, progress, and comment context
│   ├── hooks/
│   │   ├── useBookmarks.ts              # In-memory store, useSyncExternalStore, multi-tab sync
│   │   ├── useDebounce.ts               # Debounced search and storage write utilities
│   │   └── useKeyboardShortcuts.ts      # Physical code shortcut listener with IME suppression
│   ├── types/
│   │   ├── novel.ts                     # TypeScript types and Zod schemas with prototype guards
│   │   └── reader.ts                    # Reader preferences, progress, and comment types
│   ├── data/
│   │   └── mockNovels.ts                # High-fidelity mock bookmarks and catalog data
│   └── lib/
│       ├── formatters.ts                # Buddhist Era and Gregorian date formatters
│       ├── sanitize.ts                  # NFC normalization, tag stripping, ReDoS escape
│       └── uuid.ts                      # Secure UUID generator
├── tests/
│   ├── setup.ts                         # JSDOM stubs: matchMedia, IntersectionObserver, showModal
│   ├── bookmarks.schema.test.ts         # Zod schema validation boundaries tests
│   ├── useBookmarks.test.ts             # CRUD, bulk delete, and storage recovery tests
│   ├── formatters.test.ts               # Buddhist Era format output tests
│   ├── BannerCarousel.test.tsx          # Carousel navigation and WCAG controls tests
│   ├── FigmaEditModeAndFluid.test.tsx   # Edit mode, quick delete, and responsive grid tests
│   └── Section3AndReader.test.tsx       # Latest updates feed, leaderboard, and reader tests
├── next.config.mjs                      # CSP, HSTS, security headers, poweredByHeader: false
├── tailwind.config.ts                   # darkMode: 'class', Dek-D brand palette, custom aspect ratios
├── vitest.config.mts                    # React plugin, @/* path alias, jsdom test environment
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
npm test -- --run
```
Runs all 48 unit and integration tests across schemas, formatters, store operations, and UI components.

### 4. Production Build Verification
```bash
npm run build
npm start
```

---

## 🧪 Automated Test Verification

All 48 tests pass across 7 test suites:

```text
 ✓ tests/formatters.test.ts (7 tests)
 ✓ tests/bookmarks.schema.test.ts (9 tests)
 ✓ tests/useBookmarks.test.ts (9 tests)
 ✓ tests/sprint1_sprint2.test.ts (9 tests)
 ✓ tests/BannerCarousel.test.tsx (3 tests)
 ✓ tests/FigmaEditModeAndFluid.test.tsx (4 tests)
 ✓ tests/Section3AndReader.test.tsx (7 tests)

Test Files  7 passed (7)
     Tests  48 passed (48)
```

