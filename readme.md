# 🏇 Next to Go Racing — Entain Front-End Technical Challenge

This project implements the **“Next to Go Racing”** task for Entain’s Front-End Developer position.
It displays upcoming horse, greyhound, and harness races from the **Neds Racing API**, featuring live countdowns, responsive filtering, and elegant, production-grade styling.

---

## 📦 Tech Stack

- **Vue 3 (Composition API, `<script setup>`)**
- **TypeScript**
- **Pinia** for global state management
- **TailwindCSS** with custom theme configuration
- **Vite** for build tooling
- **Vitest** for testing
- **ESLint + Prettier** for code quality

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

### 3. Run Tests
```bash
npm run test
```

### 4. Run Tests with Coverage
```bash
npm run coverage
```

## 🧠 Architecture Overview

### Directory Structure

src/
 ├─ components/
 │   ├─ RaceList.vue
 │   ├─ RaceItem.vue
 │   ├─ CategoryFilter.vue
 │   └─ CountdownTimer.vue
 │
 ├─ composables/
 │   ├─ useFetchRaces.ts
 │   └─ useCountdown.ts
 │
 ├─ stores/
 │   └─ races.ts
 │
 ├─ assets/
 │   └─ styles/
 │       ├─ tailwind.css
 │       ├─ _tokens.scss
 │       └─ _theme.scss
 │
 ├─ App.vue
 └─ main.ts

### Key Components
	 •	RaceList.vue — orchestrates rendering of active races, applying sorting and expiry logic.
	 •	RaceItem.vue — displays race metadata and embeds live countdown.
	 •	CategoryFilter.vue — handles toggling between racing categories with active state visuals.
	 •	CountdownTimer.vue — isolated timer with proper interval cleanup and reactive updates.

### State Management

 The Pinia store in src/stores/races.ts manages:
	 •	Races fetched from the API (GET https://api.neds.com.au/rest/v1/racing/?method=nextraces&count=10; Content-type: application/json)
      - Greyhound racing: category_id: '9daef0d7-bf3c-4f50-921d-8e818c60fe61'
      - Harness racing: category_id: '161d9be2-e909-4326-8c2c-35ed71fb460b'
      - Horse racing: category_id: '4a2788f8-e825-4d36-9894-efd4baf1cfae'
	 •	Active category filter
	 •	Loading and error states
	 •	Derived getters for active and expired races

 Data freshness is maintained via composables with setInterval, safely disposed on component unmount.


 ## 🎨 Styling System

 Tailwind Configuration

 Tailwind is extended with custom design tokens for semantic consistency:

 theme: {
   extend: {
	 colors: {
	   brand: {
		 primary: '#F97316',
		 secondary: '#0F172A',
		 accent: '#FACC15'
	   },
	   surface: '#1E293B',
	   text: {
		 base: '#F8FAFC',
		 muted: '#94A3B8'
	   }
	 },
	 fontFamily: {
	   sans: ['Inter', 'system-ui', 'sans-serif']
	 }
   }
 }

## 🧱 Accessibility
	 •	ARIA labels on category buttons
	 •	Keyboard navigation (Tab + Enter) supported
	 •	Countdown timer announced via aria-live="polite"

## ✨ Bonus Implementations

- **Meetings View** — Added grouped view by meeting_name with sub-races accordion.
- **Theme Tokens** — Built design token SCSS maps → imported to Tailwind.
- **Skeleton Loaders** — Added shimmer placeholders while loading races.
- **Dark/Light Mode** — Persistent via localStorage toggle.

## 🧾 Known Limitations / Future Work
	 •	API rate limiting not yet handled with exponential backoff.
	 •	Internationalisation (i18n) not implemented.
	 •	Theme tokens could be extracted to external design system.

## 🧭 Author Notes

This implementation follows modern Vue 3 best practices with Composition API and TypeScript. The architecture is designed to be modular, testable, and maintainable.

Key design decisions:
- Used Pinia for state management for its simplicity and TypeScript support
- Implemented a composable pattern for reusable logic
- Created a clean component hierarchy with clear separation of concerns
- Implemented proper interval cleanup to prevent memory leaks
- Added accessibility features following WCAG guidelines
- Used TailwindCSS for rapid UI development with a consistent design system

## 📚 References
	 •	Vue 3 Docs — https://vuejs.org/
	 •	Pinia Docs — https://pinia.vuejs.org/
	 •	TailwindCSS — https://tailwindcss.com/
	 •	Vitest — https://vitest.dev/
	 •	Neds Racing API — https://api.neds.com.au/rest/v1/racing/

## ✅ Verification Checklist

 Criteria | Status
---------|--------
 Fetches and displays 5 races | ✅
 Sorts by advertised_start | ✅
 Removes races 1 min post-start | ✅
 Category filters work correctly | ✅
 Responsive layout tested | ✅
 Accessible and ARIA-compliant | ✅
 Tailwind theme configured | ✅
 Tests ≥85% coverage | ⏳ (Tests need to be fully implemented)
 README complete | ✅

## 🏁 Goal

Deliver a lightweight, elegant, and testable SPA that feels like a real Entain product — fast, accessible, and visually confident.
