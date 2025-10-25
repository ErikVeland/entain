import { defineStore } from 'pinia'
import { BettingEngine } from '../game/bettingSimulator'

// Define transaction types
export interface Transaction {
  id: string
  type: 'initial_credit' | 'bet_placed' | 'bet_cancelled' | 'bet_won' | 'bet_lost'
  amount: number
  balanceBefore: number
  balanceAfter: number
  timestamp: number
  description: string
  betId?: string
  raceId?: string
}

// Define bet selection for the betslip
export interface BetSelection {
  id: string
  raceId: string
  raceName: string
  raceNumber: number
  runnerId: string
  runnerNumber: number
  runnerName: string
  odds: number | 'SP'
  market: 'win' | 'place' | 'each-way'
  stake: number
  estimatedReturn: number
}

export const useBetsStore = defineStore('bets', {
  state: () => ({
    engine: new BettingEngine(1000),
    showGame: false,
    // Add state for data mode toggle
    useSimulatedData: true
  }),
  
  getters: {
    bankroll: (state) => state.engine.getBankroll(),
    pendingBets: (state) => state.engine.listBets().filter(bet => bet.status === 'PENDING'),
    settledBets: (state) => state.engine.listBets().filter(bet => bet.status !== 'PENDING')
  },
  
  actions: {
    setShowGame(show: boolean) {
      this.showGame = show
    },
    
    // Add action to toggle data mode
    setUseSimulatedData(useSimulated: boolean) {
      this.useSimulatedData = useSimulated
    },
    
    placeBet(raceId: string, runnerId: string, stake: number, odds: number | 'SP') {
      return this.engine.placeBet(raceId, runnerId, stake, odds)
    },
    
    cancelBet(betId: string) {
      return this.engine.cancelBet(betId)
    },
    
    settleRace(raceId: string, result: { placings: string[] }) {
      return this.engine.settleRace({
        raceId,
        placings: result.placings,
        finishTimesMs: {} // Empty object as we don't have finish times in the test
      })
    },
    
    // Add reset method to reset the engine
    reset() {
      // Create a new engine instance to reset
      this.engine = new BettingEngine(1000)
    },
    
    // Add method to get pending bets for a specific race
    getPendingBetsForRace(raceId: string) {
      return this.engine.getPendingBetsForRace(raceId)
    }
  }
})