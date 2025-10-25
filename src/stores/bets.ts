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
    
    settleBets(raceId: string, placings: string[], finishTimesMs: Record<string, number>) {
      return this.engine.settleRace({
        raceId,
        placings,
        finishTimesMs
      })
    }
  }
})