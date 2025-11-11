// src/composables/useStoreRefs.ts
import { storeToRefs } from 'pinia'
import { useRacesStore } from '../stores/races'
import { useBetsStore } from '../stores/bets'
import { useSimulationStore } from '../stores/simulation'

/**
 * Composable that provides reactive refs for all store properties
 * This helps optimize reactivity and prevents unnecessary re-renders
 * by using storeToRefs which creates refs for each state property
 */

// Races store refs
export function useRacesStoreRefs() {
  const store = useRacesStore()
  const { races, selectedCategories, loadState, errorMessage, searchQuery, timeFilter, sortOrder } = storeToRefs(store)
  
  return {
    // State properties as refs
    races,
    selectedCategories,
    loadState,
    errorMessage,
    searchQuery,
    timeFilter,
    sortOrder,
    // Getters (accessed directly to avoid conflicts with storeToRefs)
    get activeRaces() { return store.activeRaces },
    get nextFive() { return store.nextFive },
    get racesByMeeting() { return store.racesByMeeting },
    // Actions and methods
    fetchRaces: store.fetchRaces,
    toggleCategory: store.toggleCategory,
    setSearchQuery: store.setSearchQuery,
    setTimeFilter: store.setTimeFilter,
    setSortOrder: store.setSortOrder,
    startLoops: store.startLoops,
    stopLoops: store.stopLoops,
    clearCache: store.clearCache,
    reset: store.reset,
    pruneExpired: store.pruneExpired
  }
}

// Bets store refs
export function useBetsStoreRefs() {
  const store = useBetsStore()
  const { showGame, useSimulatedData, showGameOver, lastWonBetId } = storeToRefs(store)
  
  return {
    // State properties as refs
    showGame,
    useSimulatedData,
    showGameOver,
    lastWonBetId,
    // Getters (accessed directly to avoid conflicts with storeToRefs)
    get bankroll() { return store.bankroll },
    // Actions and methods
    initializeService: store.initializeService,
    setShowGame: store.setShowGame,
    setUseSimulatedData: store.setUseSimulatedData,
    acceptWelcomeCredits: store.acceptWelcomeCredits,
    checkGameOver: store.checkGameOver,
    placeBet: store.placeBet,
    cancelBet: store.cancelBet,
    settleRace: store.settleRace,
    reset: store.reset,
    cashoutBet: store.cashoutBet
  }
}

// Simulation store refs
export function useSimulationStoreRefs() {
  const store = useSimulationStore()
  const { controllers, raceStatus, speedMultipliers, raceProgress, commentaryState, displayState, cleanupTimers } = storeToRefs(store)
  
  return {
    // State properties as refs
    controllers,
    raceStatus,
    speedMultipliers,
    raceProgress,
    commentaryState,
    displayState,
    cleanupTimers,
    // Getters (accessed directly to avoid conflicts with storeToRefs)
    get activeRaces() { return store.activeRaces },
    get getSimulationController() { return store.getSimulationController },
    get isRaceActive() { return store.isRaceActive },
    get getRaceStatus() { return store.getRaceStatus },
    get getSpeedMultiplier() { return store.getSpeedMultiplier },
    get getRaceLeader() { return store.getRaceLeader },
    get getCommentaryState() { return store.getCommentaryState },
    get getDisplayState() { return store.getDisplayState },
    get isEligibleForCleanup() { return store.isEligibleForCleanup },
    // Actions and methods
    addSimulationController: store.addSimulationController,
    removeSimulationController: store.removeSimulationController,
    startSimulation: store.startSimulation,
    stopSimulation: store.stopSimulation,
    finishSimulation: store.finishSimulation,
    updateCommentaryState: store.updateCommentaryState,
    addCommentaryToHistory: store.addCommentaryToHistory,
    updateDisplayState: store.updateDisplayState,
    startResultsDisplay: store.startResultsDisplay,
    transitionToDisplayed: store.transitionToDisplayed,
    markEligibleForCleanup: store.markEligibleForCleanup,
    setSpeedMultiplier: store.setSpeedMultiplier,
    updateRaceProgress: store.updateRaceProgress,
    getRaceProgress: store.getRaceProgress,
    resetSimulation: store.resetSimulation,
    resetAllSimulations: store.resetAllSimulations
  }
}