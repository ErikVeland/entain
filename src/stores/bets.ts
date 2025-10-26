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
    useSimulatedData: true,
    // Track last won bet for animations
    lastWonBetId: ''
  }),
  
  getters: {
    bankroll: (state) => state.engine.getBankroll(),
    pendingBets: (state) => state.engine.listBets().filter(bet => bet.status === 'PENDING'),
    settledBets: (state) => state.engine.listBets().filter(bet => bet.status !== 'PENDING'),
    lastWonBetId: (state) => state.lastWonBetId
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
      try {
        return this.engine.placeBet(raceId, runnerId, stake, odds)
      } catch (error) {
        console.error('Error placing bet:', error)
        throw error
      }
    },
    
    cancelBet(betId: string) {
      try {
        return this.engine.cancelBet(betId)
      } catch (error) {
        console.error('Error cancelling bet:', error)
        throw error
      }
    },
    
    settleRace(raceId: string, result: { placings: string[] }) {
      try {
        const settlements = this.engine.settleRace({
          raceId,
          placings: result.placings,
          finishTimesMs: {} // Empty object as we don't have finish times in the test
        })
        
        // Track the last won bet for animations
        const winningSettlement = settlements.find(s => s.result === 'WON')
        if (winningSettlement) {
          this.lastWonBetId = winningSettlement.betId
        }
        
        return settlements
      } catch (error) {
        console.error('Error settling race:', error)
        throw error
      }
    },
    
    // Add reset method to reset the engine
    reset() {
      try {
        // Create a new engine instance to reset
        this.engine = new BettingEngine(1000)
      } catch (error) {
        console.error('Error resetting engine:', error)
        throw error
      }
    },
    
    // Add method to get pending bets for a specific race
    getPendingBetsForRace(raceId: string) {
      try {
        return this.engine.getPendingBetsForRace(raceId)
      } catch (error) {
        console.error('Error getting pending bets:', error)
        throw error
      }
    }
  }
})