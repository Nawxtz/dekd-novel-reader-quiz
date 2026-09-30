# Dek-D Web Novel Reader and Community Platform

An accessible, responsive, and high-performance Web Novel Reader and Bookmarks platform built for the Dek-D Front-end Developer Take-Home Technical Assessment.

Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Zod, and Vitest.

- Live Demo: https://dekdfrontendquiz-seven.vercel.app
- Repository: https://github.com/Nawxtz/dekd-novel-reader-quiz

---

## Table of Contents

- [Overview](#overview)
- [Acceptance Criteria Alignment](#acceptance-criteria-alignment)
- [Key Features](#key-features)
  - [Section 1: Promotional Novel Banner Carousel](#section-1-promotional-novel-banner-carousel)
  - [Section 2: Cover-First Novel Bookmarks](#section-2-cover-first-novel-bookmarks)
  - [Section 3: Latest Updates and Community Leaderboard](#section-3-latest-updates-and-community-leaderboard)
  - [Section 4: Dedicated Novel Reader Route](#section-4-dedicated-novel-reader-route)
  - [Platform-Wide Capabilities](#platform-wide-capabilities)
- [Architecture and Reliability](#architecture-and-reliability)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Automated Test Verification](#automated-test-verification)
- [Security and Compliance](#security-and-compliance)

---

## Overview

This project implements a web novel platform designed around user needs: visual-first novel discovery, clear reading continuity, and zero cognitive friction. The architecture leverages modern React patterns with synchronous in-memory state management, resilient offline-first persistence, and fluid responsive design.

---

## Acceptance Criteria Alignment

| Requirement | Implementation Detail | Status |
| :--- | :--- | :--- |
| 1. Create, Edit, and Delete Bookmarks | Full CRUD with modal dialogs, bulk edit mode, quick delete confirmation, and automatic chapter progress sync. | Complete |
| 2. Promotional Novel Banners | Center-focused carousel with left and right peeking cards, auto-play, touch swipe, and WCAG 2.2.2 play/pause controls. | Complete |
| 3. Web Responsive Design | Fluid layout scaling from 2 to 5 columns on bookmarks and 2 to 4 columns on latest updates across all viewports. | Complete |
| 4. Modern Framework Stack | Built on Next.js 14 App Router, React 18, TypeScript, and Tailwind CSS. | Complete |

---

## Key Features

### Section 1: Promotional Novel Banner Carousel

- **Figma Design Alignment:** Centered active novel banner with left and right peeking cards.
- **Accessibility and Motion (WCAG 2.2.2):** Dedicated Play and Pause button for screen readers and keyboard users. Auto-rotation pauses on mouse hover, keyboard focus, and when the user enables `prefers-reduced-motion`.
- **LCP Optimization:** First banner slide marked with Next.js Image `priority` and `fetchPriority="high"`, server-rendered in initial HTML to anchor Largest Contentful Paint under 1.2s.
- **Zero-Clone Architecture:** Avoids DOM clones entirely to prevent React 18 `inert` warnings, using index wrapping with modulo arithmetic and CSS `touch-action: pan-y` for smooth mobile scrolling.

### Section 2: Cover-First Novel Bookmarks

- **Header and Controls:** Bold Thai title "รายการที่คั่นไว้" with full-width subtle divider, dynamic count indicator, and Edit mode toggle.
- **Quick Resume Bar:** Automatically detects the most recently read novel from storage and renders a prominent 1-tap "อ่านต่อทันที" banner with live chapter progress.
- **Real-Time Counters:** Category filter tabs and reading status chips display live counts (for example, "ทั้งหมด (18)", "แฟนตาซี (4)", "กำลังอ่าน (15)").
- **Cover-First Poster Design:**
  - High-visibility vertical cover artwork (`aspect-[2/3]`).
  - Top-left glassmorphic category badge.
  - Top-right Quick Delete button with confirmation modal (or multi-select checkbox in bulk edit mode).
  - Ambient reading progress bar and chapter indicator embedded along the bottom edge of the artwork.
  - Clean card metadata: 2-line clamped title, author link, and Buddhist Era bookmark timestamp.
  - Full-width call-to-action button: "อ่านต่อ ตอนที่ {n}".
- **Dynamic 2 to 5 Column Scaling:**
  - Mobile (<640px): 2 columns.
  - Tablet (640-1024px): 3 columns.
  - Desktop (1024-1536px): 4 columns.
  - Ultrawide (≥1536px): 5 columns.
- **Bulk Edit Mode:** Multi-selection checkboxes with "Select All" toggle and modal confirmation.

### Section 3: Latest Updates and Community Leaderboard

- **Cover-First Discovery Grid:** Responsive 2 to 4 column feed showcasing fresh novel chapters with category tags, 1-click bookmark actions, and direct chapter links.
- **Author Works Filtering:** Tap any creator name to filter the catalog to works by that author, with an active filter badge and reset button.
- **Community Top 10 Leaderboard:** Real-time ranking with tabs for Weekly, Monthly, and All-Time popular novels.

### Section 4: Dedicated Novel Reader Route

Path: `/read/[novelId]/[chapter]`

- **Novel Hero Banner:** Displays cover, title, author, category, total chapters, and reading status.
- **Automatic Reading Progress Sync:** Reading a chapter automatically updates the bookmark's `currentChapter` and `lastReadAt` in storage.
- **Reader Controls:** Configurable font sizes, font families (Noto Sans Thai, Sarabun, Charm), line width measures, and reading themes (Light, Sepia, Night, Dark).
- **Chapter Comments:** Interactive discussion thread with comment submission, like counters, and local persistence.

### Platform-Wide Capabilities

- **Theme Switcher:** Dark and Light mode toggle with zero-FOUC blocking script in `<head>`.
- **Thai and English Internationalization:** Instant locale toggle in the navbar with complete dictionaries.
- **Keyboard Shortcuts (Thai-Layout Safe):**
  - `/` Focus search input.
  - `e` Toggle bulk edit mode.
  - `n` Open add bookmark modal.
  - `?` Open keyboard shortcuts cheat sheet.
  - `Esc` Close any open modal dialog.
  - Evaluated on physical `e.code` (`KeyE`, `Slash`) to function seamlessly on Thai keyboard layouts.

---

## Architecture and Reliability

| Area | Challenge | Implementation Solution |
| :--- | :--- | :--- |
| **Storage Re-render Loop** | Deriving state with `JSON.parse` inside `getSnapshot` triggers a new array reference every render | In-Memory Store as Single Source of Truth (`bookmarksStore`). UI updates synchronously in 0ms; `localStorage` is an asynchronous persistence sink flushed on `visibilitychange` and `pagehide`. |
| **SSR Hydration Mismatch** | Rendering empty array `[]` on SSR flashes false empty states before client storage hydrates | `getServerSnapshot` returns a strict `null` sentinel. The UI renders exact-dimension skeleton cards until client hydration completes. |
| **Thai Tone Mark Clipping** | Default line-height cuts off Thai upper and lower vowel glyphs inside `line-clamp-2` containers | Title line-height set to `leading-relaxed` (1.625) and `min-h-[3rem]` (48px) with `break-words` and `<html lang="th">`. |
| **Buddhist Era Formatting** | Standard `Intl` formats time with colons (`22:56`), but Figma specifies dot format (`22.56 น.`) | Pinned `Intl.DateTimeFormat('th-TH-u-ca-buddhist', { timeZone: 'Asia/Bangkok' }).formatToParts()` to assemble `{day} {month} {yy} / {HH}.{mm} น.`. |
| **Prototype Pollution and ReDoS** | Malicious JSON imports containing `__proto__` or catastrophic regex | Strict Zod validation with `z.preprocess()` checking object prototypes, and `sanitizeSearchRegex()` escaping query strings. |
| **Security Headers** | Vulnerability to clickjacking, MIME sniffing, and cross-site leaks | Configured CSP, HSTS, `X-Content-Type-Options: nosniff`, and `X-Frame-Options: DENY` in `next.config.mjs`. |

---

## Project Structure

```
dekd_frontend_quiz/
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # Root layout: Noto Sans Thai, ThemeProvider
│   │   ├── page.tsx                     # Dashboard: Navbar, BannerCarousel, BookmarkList, Section 3
│   │   ├── read/[novelId]/[chapter]/    # Dedicated reader route with Hero banner and chapter viewer
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

## Getting Started

### 1. Installation

```bash
npm install
```

### 2. Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Automated Test Suite

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

## Automated Test Verification

All 48 tests pass across 7 test suites:

```text
 PASS  tests/formatters.test.ts (7 tests)
 PASS  tests/bookmarks.schema.test.ts (9 tests)
 PASS  tests/useBookmarks.test.ts (9 tests)
 PASS  tests/sprint1_sprint2.test.ts (9 tests)
 PASS  tests/BannerCarousel.test.tsx (3 tests)
 PASS  tests/FigmaEditModeAndFluid.test.tsx (4 tests)
 PASS  tests/Section3AndReader.test.tsx (7 tests)

Test Files: 7 passed, 7 total
Tests:      48 passed, 48 total
```

---

## Security and Compliance

- **Input Sanitization:** User-submitted title, author, and note fields are processed through NFC normalization and HTML tag stripping. Search queries are escaped against ReDoS vulnerabilities.
- **Storage Boundaries:** JSON imports and LocalStorage envelopes are strictly validated against Zod schemas. Prototype pollution attempts using `__proto__`, `constructor`, or `prototype` keys are rejected.
- **Security Headers:** HTTP headers configured in `next.config.mjs` enforce `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `Strict-Transport-Security`.


