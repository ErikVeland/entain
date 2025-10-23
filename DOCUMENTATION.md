# Next to Go Racing - Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Components](#components)
4. [State Management](#state-management)
5. [Composables](#composables)
6. [Styling](#styling)
7. [Testing](#testing)
8. [Accessibility](#accessibility)
9. [Performance](#performance)
10. [Deployment](#deployment)

## Project Overview

The "Next to Go Racing" application is a real-time racing event dashboard that displays upcoming horse, greyhound, and harness racing events from the Neds API. The application provides live countdown timers, category filtering, and automatic removal of races once they've started.

### Key Features
- Real-time race data fetching from Neds API
- Live countdown timers with automatic cleanup
- Category-based filtering with visual feedback
- Automatic removal of races one minute after their advertised start time
- Responsive design for all device sizes
- Accessible interface with ARIA support
- Dark/light mode toggle
- Meetings view with grouped races by venue

## Architecture

The application follows a component-based architecture with Vue 3 Composition API and TypeScript. The architecture is organized as follows:

```
src/
├── components/          # Reusable UI components
├── composables/         # Reusable logic functions
├── stores/              # Pinia state management
├── assets/
│   └── styles/          # CSS and SCSS files
├── App.vue              # Root component
└── main.ts              # Application entry point
```

### Data Flow
1. **API Integration**: The application fetches data from the Neds API via the `useFetchRaces` composable
2. **State Management**: Data is stored and managed in the Pinia store
3. **Component Rendering**: Components consume data from the store and render the UI
4. **User Interaction**: User actions trigger store mutations or API calls
5. **Real-time Updates**: Timers and polling keep the data fresh

## Components

### App.vue
The root component that provides the main layout structure and coordinates between different views.

**Props**: None
**Emits**: None
**Features**:
- Theme toggle (dark/light mode)
- View switching (races vs meetings)
- Category filtering controls

### RaceList.vue
Orchestrates the display of active races in a grid layout, applying sorting and expiry logic.

**Props**: None
**Emits**: None
**Features**:
- Displays exactly 5 races at all times
- Loading, error, and empty states
- Responsive grid layout

### RaceColumn.vue
Displays individual race information in a card format with header and runner details.

**Props**:
- `race`: RaceSummary object containing race details

**Emits**: None
**Features**:
- Race header with category icon and countdown timer
- List of runners with odds and details
- Responsive design

### RaceHeader.vue
Displays the header section for each race with category icon and countdown timer.

**Props**:
- `meetingName`: Name of the racing venue
- `raceNumber`: Sequential number of the race
- `categoryId`: ID of the race category
- `startTime`: Start time in milliseconds

**Emits**: None
**Features**:
- Category-specific icons (horse, greyhound, harness)
- Live countdown timer
- "LIVE" badge for in-progress races

### RunnerRow.vue
Displays individual runner metadata including name, jockey, and odds.

**Props**:
- `runner`: Runner object with details

**Emits**: None
**Features**:
- Silk color icon for visual identification
- Runner name and number
- Jockey/driver name and weight
- Odds display with trend indicators

### CategoryFilter.vue
Handles toggling between racing categories with visual indication of active state.

**Props**:
- `categories`: Array of category objects

**Emits**:
- `toggle-category`: When a category is selected/deselected

**Features**:
- Visual indication of active categories
- Keyboard navigation support
- ARIA attributes for screen readers

### CountdownTimer.vue
Isolated timer component with proper interval cleanup and reactive updates.

**Props**:
- `startTime`: Timestamp when the race starts

**Emits**: None
**Features**:
- Live countdown display
- "Starting soon" and "In progress" states
- Proper interval cleanup

### MeetingsView.vue
Displays races grouped by meeting name with accordion functionality.

**Props**: None
**Emits**: None
**Features**:
- Grouped view by meeting name
- Collapsible sections
- Skeleton loaders during loading state

## State Management

The application uses Pinia for global state management. The store is defined in `src/stores/races.ts`.

### State
```typescript
{
  races: RaceSummary[]           // Fetched race data
  selectedCategories: Set<string> // Active category filters
  loadState: 'idle' | 'loading' | 'ready' | 'error'
  errorMessage: string           // Error message when loadState is 'error'
  _tickHandle: number | null     // Interval handle for pruning expired races
  _pollHandle: number | null     // Interval handle for polling new data
}
```

### Getters
- `activeRaces`: Filtered and sorted races that are not expired
- `nextFive`: First 5 races from activeRaces
- `racesByMeeting`: Races grouped by meeting name for the meetings view

### Actions
- `fetchRaces`: Fetch and normalize race data from API
- `toggleCategory`: Toggle category filter on/off
- `pruneExpired`: Remove expired races from state
- `startLoops`: Initialize ticking and polling intervals
- `stopLoops`: Clean up intervals on component unmount
- `reset`: Reset store to initial state

## Composables

### useFetchRaces
Handles API fetching logic with proper error handling.

**Usage**:
```typescript
import { useFetchRaces } from '../composables/useFetchRaces'

const { fetchRaces, loading, error } = useFetchRaces()
```

**Returns**:
- `fetchRaces`: Function to trigger race fetching
- `loading`: Ref indicating if fetch is in progress
- `error`: Ref containing error message if any

### useCountdown
Manages countdown timer logic with cleanup on component unmount.

**Usage**:
```typescript
import { useCountdown } from '../composables/useCountdown'

const { formattedTime, isStartingSoon, isInProgress } = useCountdown(startTimeMs)
```

**Returns**:
- `formattedTime`: Ref containing formatted time string
- `isStartingSoon`: Ref indicating if race is about to start
- `isInProgress`: Ref indicating if race is in progress

## Styling

The application uses TailwindCSS with a custom theme configuration for consistent styling.

### Theme Configuration
Custom colors and fonts are defined in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      brand: {
        primary: '#F97316',   // orange-500
        secondary: '#0F172A', // slate-900
        accent: '#FACC15'     // yellow-400
      },
      surface: {
        DEFAULT: '#0B1220',   // deep background
        raised: '#111827',    // gray-900
        sunken: '#0A0F1C'
      },
      text: {
        base: '#F8FAFC',      // slate-50
        muted: '#94A3B8',     // slate-400
        inverse: '#111827'
      }
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'Apple Color Emoji', 'Segoe UI Emoji', 'sans-serif'],
      mono: ['SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace']
    }
  }
}
```

### SCSS Tokens
Design tokens are defined in `src/assets/styles/_tokens.scss` and imported in `src/assets/styles/_theme.scss` for semantic styling.

## Testing

The application uses Vitest for unit testing with jsdom for browser simulation.

### Test Structure
Tests are organized in `src/components/__tests__/` with one test file per component.

### Running Tests
```bash
npm run test        # Run tests in watch mode
npm run coverage    # Generate coverage report
```

### Test Coverage
The goal is to achieve ≥85% test coverage across all components and layers.

## Accessibility

The application follows WCAG guidelines for accessibility:

### ARIA Attributes
- `aria-pressed` for active category filters
- `aria-expanded` for collapsible meetings
- `aria-live="polite"` for countdown timer updates

### Keyboard Navigation
- Tab navigation through interactive elements
- Enter/space activation of buttons
- Proper focus management

### Semantic HTML
- Proper heading hierarchy
- Landmark roles
- Sufficient color contrast

## Performance

### Memory Management
- Cleanup of intervals and timers on component unmount
- Bounded race data storage (maximum 50 races)
- Efficient reactive updates

### Network Optimization
- API polling every 15 seconds
- Cache prevention headers
- Error handling for network failures

### Rendering Optimizations
- Virtual scrolling for large lists (planned)
- Efficient component re-rendering
- Lazy loading of non-critical resources

## Deployment

### Build Process
```bash
npm run build       # Build for production
```

### Development Server
```bash
npm run dev         # Start development server
```

### Environment Requirements
- Node.js >= 16
- npm >= 7

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript support