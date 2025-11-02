# Race Simulation Improvements - Implementation Summary

## Overview
This document summarizes the implementation of race simulation improvements to address issues with repetitive commentary, missing race identification, timing conflicts, bet settlement, and concurrent race handling.

## Changes Implemented

### 1. Enhanced Simulation Store (`src/stores/simulation.ts`)

#### New Types and Interfaces
- **GapCategory**: `'neck-and-neck' | 'narrow' | 'clear' | 'none'` - Categorizes the gap between leading runners
- **RacePhase**: `'early' | 'mid' | 'late'` - Tracks race progression
- **CommentaryType**: `'leader' | 'gap' | 'phase' | 'generic'` - Types of commentary messages
- **CommentaryState**: Tracks commentary state per race including:
  - Current leader and second-place runner IDs
  - Last gap category and commentary type
  - Race phase and timestamp
  - Commentary history (last 5 messages)
- **RaceLifecycleStatus**: Extended lifecycle states:
  - `pending`: Race not started
  - `countdown`: Race countdown active
  - `running`: Race simulation in progress
  - `finished_simulation`: Simulation completed, results available
  - `finished_displayed`: Results displayed to user
  - `expired`: Race eligible for cleanup
- **DisplayState**: Manages result display timing:
  - Display status and timestamps
  - User bet flags (hasUserBets, hasWinningBets)
  - Grace period tracking

#### New State Properties
- `commentaryState: Map<raceId, CommentaryState>` - Per-race commentary tracking
- `displayState: Map<raceId, DisplayState>` - Per-race display state
- `cleanupTimers: Map<raceId, number>` - Cleanup timer management

#### New Actions
- `updateCommentaryState(raceId, updates)` - Updates commentary state
- `addCommentaryToHistory(raceId, message, type)` - Adds commentary to history
- `updateDisplayState(raceId, updates)` - Updates display state
- `startResultsDisplay(raceId, hasUserBets, hasWinningBets)` - Initiates result display with appropriate timing
- `transitionToDisplayed(raceId)` - Transitions to grace period
- `markEligibleForCleanup(raceId)` - Marks race as eligible for removal

#### Timing Configuration
```typescript
TIMING_CONFIG = {
  RESULTS_DISPLAY_MIN_DURATION: 15000, // 15 seconds
  RESULTS_DISPLAY_WITH_BETS_DURATION: 30000, // 30 seconds
  RESULTS_DISPLAY_WITH_WIN_DURATION: 45000, // 45 seconds
  GRACE_PERIOD_DURATION: 45000, // 45 seconds
  COMMENTARY_THROTTLE_SAME_TYPE: 5000, // 5 seconds
  COMMENTARY_THROTTLE_DIFF_LEADER: 3000, // 3 seconds
}
```

### 2. Commentary Deduplication System (`src/composables/useCommentaryDeduplication.ts`)

#### Key Functions

**`generateCommentary(context)`**
- Generates commentary only when meaningful changes occur
- Checks for leader changes, gap category changes, and phase transitions
- Applies time-based throttling to prevent repetition
- Returns `null` when commentary should be suppressed

**Context Object**
```typescript
{
  raceId: string
  meetingName: string
  raceNumber: number
  categoryId: string
  leaderId: string | null
  secondId: string | null
  gap: number
  raceProgress: number (0-1)
  runnerData: Array<{ id, name, odds }>
}
```

**Deduplication Logic**
- Tracks last leader, second place, gap category, and phase
- Immediate commentary for: leader changes, gap category changes, phase transitions
- Throttled commentary for: same type (5s), different leader in same gap (3s)
- Avoids repetition by filtering recently used messages from commentary pool

**Race Identification**
- All commentary formatted as: `"[Meeting Name] R[Race Number]: [Message]"`
- Examples:
  - "Flemington R7: Thunder Bolt and Lightning Strike are neck and neck!"
  - "Warwick Farm R3: Quick Step has opened up a clear lead over Fast Lane"

### 3. Updated RaceColumn Component (`src/components/RaceColumn.vue`)

#### Imports
- Added `useCommentaryDeduplication` composable
- Uses `generateCommentary`, `generateStartCommentary`, `generateFinishCommentary`

#### Tick Handler Changes
Replaced inline commentary generation (100+ lines) with:
```typescript
const generated = generateCommentary({
  raceId: props.race.id,
  meetingName: props.race.meeting_name,
  raceNumber: props.race.race_number,
  categoryId: props.race.category_id,
  leaderId,
  secondId,
  gap,
  raceProgress: avgProgress,
  runnerData: runners.map(r => ({ id: r.id, name: r.name, odds: r.odds }))
});

if (generated) {
  commentary = generated;
}
```

#### Finish Handler Enhancement
- Calls `simulationStore.finishSimulation(raceId)` to transition to `finished_simulation` state
- Generates finish commentary with winner name: `generateFinishCommentary(meetingName, raceNumber, winnerName)`
- Determines bet status (hasUserBets, hasWinningBets)
- Calls `simulationStore.startResultsDisplay(raceId, hasUserBets, hasWinningBets)` to manage result display timing
- Dispatches race-finish event with formatted commentary and race metadata

### 4. Race Lifecycle Management

#### State Machine Flow
```
PENDING → COUNTDOWN → RUNNING → FINISHED_SIMULATION → FINISHED_DISPLAYED → EXPIRED
```

#### Cleanup Protection
- Races cannot be cleaned up until status reaches `EXPIRED`
- Results display for minimum duration based on bet status:
  - No bets: 15 seconds
  - With bets: 30 seconds
  - With winning bets: 45 seconds
- Grace period of 45 seconds after display duration
- Cleanup timers are properly cleared on manual cleanup

#### Timer Management
- All timers stored in `cleanupTimers` map
- Timers cleared on simulation stop/removal
- Sequential timing: display timer → grace period timer → cleanup eligibility

### 5. Concurrent Race Handling

#### State Isolation
- Each race has independent:
  - Simulation controller (keyed by race ID)
  - Commentary state (separate Map entry)
  - Display state (separate Map entry)
  - Cleanup timer (separate Map entry)
  
#### Event Namespacing
- All custom events include race metadata:
  - `raceId`: Unique race identifier
  - `meetingName`: Race meeting name
  - `raceNumber`: Race number
  - `categoryId`: Category identifier

#### Performance Optimization
- Adaptive tick intervals based on concurrent simulation count (from `useSimulationManager`)
- Commentary throttling prevents excessive DOM updates
- State updates batched where possible

### 6. Bet Settlement and Display

#### Metadata Propagation
The bet placement flow already includes complete race metadata:
- Race ID, meeting name, race number
- Category ID, advertised start time
- Runner name and number

#### Display Components
**BetCard.vue**
- Shows race identification: `{{ selection.raceName }} R{{ selection.raceNumber }}`
- Already implements proper display structure

**PendingBetsList.vue**
- Retrieves race metadata from races store when available
- Shows meeting name and race number for each bet
- Falls back to race ID snippet if metadata unavailable

## Testing Recommendations

### 1. Commentary Deduplication
- Start a race and observe commentary
- Verify no repeated "neck and neck" messages within 5-second window
- Check leader changes trigger immediate commentary
- Confirm gap category changes (neck-and-neck → narrow → clear) generate new commentary
- Verify all commentary includes race identification

### 2. Race Lifecycle
- Place bet on race
- Let race run to completion
- Verify results display appears
- Confirm results remain visible for minimum 30 seconds (with bets)
- Check race is not removed until grace period completes
- Verify winning bets extend display duration to 45 seconds

### 3. Concurrent Races
- Start 3+ races simultaneously
- Verify each generates independent commentary
- Check no cross-contamination of events
- Confirm each race has distinct result display timing
- Verify cleanup occurs independently per race

### 4. Bet Settlement
- Place bet on race
- Let race finish
- Verify bet status updates immediately
- Check settlement includes race name and number
- Confirm winning bets remain visible for 30 seconds
- Verify losing bets show correct race identification

## Key Benefits

1. **No Repetitive Commentary**: Intelligent deduplication prevents repeated messages about the same race state
2. **Clear Race Identification**: All commentary, events, and displays include meeting name and race number
3. **Results Always Visible**: State machine ensures results display for minimum duration before cleanup
4. **Proper Bet Settlement**: Complete metadata flow ensures bets show correct race info throughout lifecycle
5. **Concurrent Race Support**: Independent state management per race prevents interference
6. **Configurable Timing**: All durations centralized in TIMING_CONFIG for easy adjustment

## Configuration

### Timing Adjustments
Edit `TIMING_CONFIG` in `src/stores/simulation.ts`:
```typescript
export const TIMING_CONFIG = {
  RESULTS_DISPLAY_MIN_DURATION: 15000, // Adjust base display time
  RESULTS_DISPLAY_WITH_BETS_DURATION: 30000, // Adjust for races with bets
  RESULTS_DISPLAY_WITH_WIN_DURATION: 45000, // Adjust for winning bets
  GRACE_PERIOD_DURATION: 45000, // Adjust cleanup delay
  COMMENTARY_THROTTLE_SAME_TYPE: 5000, // Adjust repetition prevention
  COMMENTARY_THROTTLE_DIFF_LEADER: 3000, // Adjust leader change throttle
}
```

### Commentary Customization
Edit commentary pools in `src/composables/useCommentaryDeduplication.ts`:
- `generateCategoryCommentary()` function contains all message pools
- Separate pools for each gap category (neck-and-neck, narrow, clear)
- Separate pools for each race phase (early, mid, late)
- Category-specific flavor can be added (e.g., greyhound speed references)

## Migration Notes

### Breaking Changes
None - all changes are backward compatible

### Deprecated Patterns
- Inline commentary generation in RaceColumn.vue (replaced with composable)
- Direct status transitions in finish handler (replaced with state machine)

### New Dependencies
- None - uses existing Vue 3 and Pinia infrastructure

## Future Enhancements

1. **Persistent Bet History**: Store settled bets with race metadata for history view
2. **Commentary Audio**: Convert text commentary to speech for enhanced immersion
3. **Result Animations**: Podium animations for top 3 finishers
4. **Multi-Race Parlay Support**: Enhanced display for multi-leg bets
5. **Race Replay**: Store simulation data for instant replay functionality
