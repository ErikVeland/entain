# Next to Go Racing - Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Components](#components)
4. [State Management](#state-management)
5. [Composables](#composables)
6. [Game Simulation](#game-simulation)
7. [Styling](#styling)
8. [Testing](#testing)
9. [Accessibility](#accessibility)
10. [Performance](#performance)
11. [Deployment](#deployment)

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
- Betting simulation mode with realistic odds and market dynamics (AI-assisted development)

## Architecture

The application follows a component-based architecture with Vue 3 Composition API and TypeScript. The architecture is organized as follows:

```
src/
├── components/          # Reusable UI components
├── composables/         # Reusable logic functions
├── stores/              # Pinia state management
├── game/                # Betting and race simulation engines
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
6. **Simulation Mode**: In simulation mode, the betting engine and race simulation provide dynamic data

## Components

### App.vue
The root component that provides the main layout structure and coordinates between different views.

**Props**: None
**Emits**: None
**Features**:
- Theme toggle (dark/light mode)
- View switching (races vs meetings)
- Category filtering controls
- Simulation mode toggle
- Live race updates in header
- Next race information display

### RaceList.vue
Orchestrates the display of active races in a grid layout, applying sorting and expiry logic.

**Props**: None
**Emits**: None
**Features**:
- Displays exactly 5 races at all times
- Loading, error, and empty states
- Responsive grid layout
- Carousel behavior for race transitions

### RaceColumn.vue
Displays individual race information in a card format with header, runners, and betting controls.

**Props**:
- `race`: RaceSummary object containing race details
- `isActive`: Boolean indicating if this is the currently focused race
- `isExpired`: Boolean indicating if the race has expired

**Emits**:
- `navigate-next`: When right arrow key is pressed
- `navigate-prev`: When left arrow key is pressed
- `select`: When enter/space is pressed
- `add-to-betslip`: When a runner's odds are clicked
- `race-started`: When the race simulation begins
- `race-finished`: When the race simulation completes

**Features**:
- Race header with category icon and countdown timer
- List of runners with odds and details
- Betting controls and odds trend indicators
- Odds movement visualization charts
- Responsive design
- Race simulation integration

### RaceHeader.vue
Displays the header section for each race with category icon and countdown timer.

**Props**:
- `meetingName`: Name of the racing venue
- `raceNumber`: Sequential number of the race
- `categoryId`: ID of the race category
- `startTime`: Start time in milliseconds
- `isExpired`: Boolean indicating if the race has expired
- `raceId`: Unique identifier for the race

**Emits**: None
**Features**:
- Category-specific icons (horse, greyhound, harness)
- Live countdown timer
- "LIVE" badge for in-progress races
- Responsive design with category color coding

### RunnerRow.vue
Displays individual runner metadata including name, jockey, and odds.

**Props**:
- `runner`: Runner object with details
- `raceId`: Unique identifier for the race
- `raceName`: Name of the racing venue
- `raceNumber`: Sequential number of the race
- `isExpired`: Boolean indicating if the race has expired

**Emits**: None
**Features**:
- Silk color icon for visual identification
- Runner name and number
- Jockey/driver name and weight
- Odds display with trend indicators (▲/▼)
- Clickable odds buttons for bet placement
- Animation effects for odds changes
- Responsive text display (BT expands to Best Time on larger screens)

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
- Responsive design

### CountdownTimer.vue
Isolated timer component with proper interval cleanup and reactive updates.

**Props**:
- `startTime`: Timestamp when the race starts

**Emits**: None
**Features**:
- Live countdown display
- "Starting soon" and "In progress" states
- Proper interval cleanup
- ARIA announcements for time updates
- Visual warning in last 10 seconds

### MeetingsView.vue
Displays races grouped by meeting name with accordion functionality.

**Props**: None
**Emits**: None
**Features**:
- Grouped view by meeting name
- Collapsible sections
- Skeleton loaders during loading state
- Responsive design

### BetPlacer.vue
Interactive betting interface for placing wagers on runners.

**Props**:
- `race`: RaceSummary object containing race details
- `runner`: Runner object with details

**Emits**: None
**Features**:
- Stake input with validation
- Market selection (win/place/each-way)
- Real-time payout calculation
- Betting restrictions based on race status
- Visual feedback for betting actions

### BetslipDrawer.vue
Slide-out panel for managing bet selections and placement.

**Props**:
- `isOpen`: Boolean indicating if the betslip is open

**Emits**:
- `close`: When the betslip should be closed
- `update:isOpen`: When the betslip open state changes

**Features**:
- Bet selection management
- Stake adjustment for multiple bets
- Real-time total calculation
- Bet placement and cancellation
- Visual feedback for bet outcomes

## State Management

The application uses Pinia for global state management with multiple stores for different concerns.

### Races Store (src/stores/races.ts)

**State**
```javascript
{
  races: RaceSummary[]           // Fetched race data
  selectedCategories: Set<string> // Active category filters
  loadState: 'idle' | 'loading' | 'ready' | 'error'
  errorMessage: string           // Error message when loadState is 'error'
  _tickHandle: number | null     // Interval handle for pruning expired races
  _pollHandle: number | null     // Interval handle for polling new data
}
```

**Getters**
- `activeRaces`: Filtered and sorted races that are not expired
- `nextFive`: First 5 races from activeRaces
- `racesByMeeting`: Races grouped by meeting name for the meetings view
- `CATEGORY_IDS`: Constant mapping of category names to IDs

**Actions**
- `fetchRaces`: Fetch and normalize race data from API
- `toggleCategory`: Toggle category filter on/off
- `pruneExpired`: Remove expired races from state
- `startLoops`: Initialize ticking and polling intervals
- `stopLoops`: Clean up intervals on component unmount
- `reset`: Reset store to initial state

### Bets Store (src/stores/bets.ts)

**State**
```javascript
{
  engine: BettingEngine        // Betting engine instance
  showGame: boolean            // Whether game mode is enabled
  useSimulatedData: boolean    // Whether to use simulated data
  lastWonBetId: string         // ID of the last won bet for animations
}
```

**Getters**
- `bankroll`: Current bankroll from the betting engine
- `pendingBets`: List of pending bets
- `settledBets`: List of settled bets
- `lastWonBetId`: ID of the last won bet

**Actions**
- `setShowGame`: Toggle game mode
- `setUseSimulatedData`: Toggle simulated data mode
- `placeBet`: Place a bet through the betting engine
- `cancelBet`: Cancel a pending bet
- `settleRace`: Settle bets for a completed race
- `reset`: Reset the betting engine
- `getPendingBetsForRace`: Get pending bets for a specific race

### Simulation Store (src/stores/simulation.ts)

**State**
```javascript
{
  controllers: Map<string, SimulationController>  // Race simulation controllers
  activeRaces: Set<string>                        // Active race IDs
  raceStatus: Map<string, 'pending' | 'running' | 'finished' | 'aborted'>  // Race statuses
  speedMultipliers: Map<string, number>           // Speed multipliers for simulations
}
```

**Getters**
- `getSimulationController`: Get a simulation controller by race ID
- `isRaceActive`: Check if a race is active
- `getRaceStatus`: Get the status of a race
- `getSpeedMultiplier`: Get the speed multiplier for a race

**Actions**
- `addSimulationController`: Add a simulation controller
- `removeSimulationController`: Remove a simulation controller
- `startSimulation`: Start a race simulation
- `stopSimulation`: Stop a race simulation
- `finishSimulation`: Mark a simulation as finished
- `setSpeedMultiplier`: Set the speed multiplier for a simulation
- `resetSimulation`: Reset a simulation
- `resetAllSimulations`: Reset all simulations

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

### useOddsSimulation
Manages odds simulation for runners with realistic market dynamics.

**Usage**:
```typescript
import { useOddsSimulation } from '../composables/useOddsSimulation'

const { initializeOddsSimulation, updateOdds, getSimulatedRunners } = useOddsSimulation()
```

**Returns**:
- `initializeOddsSimulation`: Initialize odds simulation for a race
- `updateOdds`: Update odds based on race progress
- `getSimulatedRunners`: Get current simulated runners
- `resetSimulation`: Reset a race simulation
- `generateRandomizedRunners`: Generate randomized runners for a race

### useOddsUpdater
Manages global odds updates for upcoming races.

**Usage**:
```typescript
import { useOddsUpdater } from '../composables/useOddsUpdater'

const { registerCountdownRace, unregisterCountdownRace } = useOddsUpdater()
```

**Returns**:
- `registerCountdownRace`: Register a race for odds updates
- `unregisterCountdownRace`: Unregister a race from odds updates
- `cleanup`: Clean up all odds update intervals

### useRaceSimulation
Manages race simulation controllers.

**Usage**:
```typescript
import { useRaceSimulation } from '../composables/useRaceSimulation'

const { createSimulation, getSimulation, removeSimulation } = useRaceSimulation()
```

**Returns**:
- `createSimulation`: Create a race simulation
- `getSimulation`: Get a race simulation by ID
- `removeSimulation`: Remove a race simulation
- `startSimulation`: Start a race simulation
- `stopSimulation`: Stop a race simulation
- `resetSimulation`: Reset a race simulation

## Game Simulation

RaceHub includes an advanced betting simulation system co-developed with AI assistance that provides a realistic betting experience.

### Betting Engine (src/game/bettingSimulator.ts)

The betting engine implements a comprehensive betting system with support for multiple bet types:

**Supported Bet Types**:
- WIN: Standard single runner win bet
- PLACE: Pays based on finishing position
- EACH_WAY: Combination of WIN and PLACE
- MULTI (Parlay): Multiple leg accumulator bets
- QUINELLA: Top 2 finishers in any order
- TRIFECTA: Top 3 finishers in exact order
- FIRST_FOUR: Top 4 finishers in exact order

**Features**:
- Bankroll management with virtual currency
- Bet placement with validation
- Bet cancellation for pre-race bets
- Cashout feature with configurable fees
- Settlement processing based on race results
- Progressive multi settlement
- Odds tracking and history
- Configurable betting limits
- Dead-heat rule implementation
- Category-specific PLACE terms

### Race Simulation Engine (src/game/simulatedRace.ts)

The race simulation engine provides deterministic race simulations with realistic dynamics:

**Features**:
- Deterministic outcomes with seedable simulations
- Category-specific durations for horse, greyhound, and harness
- Odds-based probabilities with overround removal
- Realistic pacing with acceleration → cruise → final kick movement patterns
- Environmental factors (weather and track conditions)
- Runner characteristics (stamina, acceleration, consistency)
- Live race progress tracking
- Result generation with finish times

### Odds Simulation (src/composables/useOddsSimulation.ts)

The odds simulation provides realistic market movements for upcoming races:

**Features**:
- Gradual, small fluctuations (±0.5%) in odds
- Individualized updates based on each runner's position
- Market dynamics that change based on race progress
- Odds capping at maximum value of 50
- Runners initialized with numeric odds values
- UI updates with proper throttling (500ms)
- Real-time odds tracking for movement visualization
- Odds trend indicators (up/down/none)

### Simulation Mode Integration

The simulation mode integrates all components to provide a cohesive betting experience:

1. **Data Initialization**: Races are populated with simulated runners and odds
2. **Odds Updates**: Continuous odds updates for upcoming races during countdown
3. **Race Start**: Automatic race start when countdown completes
4. **Live Progress**: Real-time race progress updates
5. **Result Generation**: Deterministic race results based on odds
6. **Bet Settlement**: Automatic bet settlement based on results
7. **Visual Feedback**: Animations and notifications for winning bets

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
- `aria-label` for icon buttons
- Proper labeling of form elements

### Keyboard Navigation
- Tab navigation through interactive elements
- Enter/space activation of buttons
- Arrow key navigation between races
- Proper focus management

### Semantic HTML
- Proper heading hierarchy
- Landmark roles
- Sufficient color contrast
- Focus indicators for interactive elements

## Performance

### Memory Management
- Cleanup of intervals and timers on component unmount
- Bounded race data storage (maximum 50 races)
- Efficient reactive updates
- Proper disposal of simulation controllers

### Network Optimization
- API polling every 15 seconds
- Cache prevention headers
- Error handling for network failures
- Efficient data fetching and normalization

### Rendering Optimizations
- Virtual scrolling for large lists (planned)
- Efficient component re-rendering
- Lazy loading of non-critical resources
- Throttled odds updates to prevent UI flickering

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