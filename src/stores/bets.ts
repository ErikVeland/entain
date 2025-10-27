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
    // App should start in API mode, so useSimulatedData should be false by default
    useSimulatedData: false,
    // Track last won bet for animations
    lastWonBetId: '',
    // Track if game over dialog should be shown
    showGameOver: false
  }),
  
  getters: {
    bankroll: (state) => state.engine.getBankroll(),
    pendingBets: (state) => state.engine.listBets().filter(bet => bet.status === 'PENDING'),
    settledBets: (state) => state.engine.listBets().filter(bet => bet.status !== 'PENDING'),
    // Rename the getter to avoid conflict with state property
    getLastWonBetId: (state) => state.lastWonBetId,
    // Check if bankroll is zero or negative
    isBankrupt: (state) => state.engine.getBankroll().balance <= 0
  },
  
  actions: {
    setShowGame(show: boolean) {
      console.log('Setting showGame to', show)
      this.showGame = show
    },
    
    // Add action to toggle data mode
    setUseSimulatedData(useSimulated: boolean) {
      console.log('Setting useSimulatedData to', useSimulated)
      this.useSimulatedData = useSimulated
    },
    
    // Method to add welcome credits (for restarting the game)
    acceptWelcomeCredits() {
      this.engine.addCredits(10000) // Add $100 in cents
    },
    
    // Method to check if game over dialog should be shown
    checkGameOver() {
      this.showGameOver = this.engine.getBankroll().balance <= 0
    },
    
    placeBet(raceId: string, runnerId: string, stake: number, odds: number | 'SP', advertisedStartMs?: number) {
      try {
        console.log('BetsStore.placeBet called with:', { raceId, runnerId, stake, odds, advertisedStartMs });
        const result = this.engine.placeBet(raceId, runnerId, stake, odds, advertisedStartMs)
        console.log('BettingEngine.placeBet returned:', result);
        // Check if player is now bankrupt after placing the bet
        this.checkGameOver()
        return result
      } catch (error) {
        console.error('Error placing bet:', error)
        throw error
      }
    },
    
    cancelBet(betId: string) {
      try {
        const result = this.engine.cancelBet(betId)
        // Check if player is now bankrupt after cancelling the bet
        this.checkGameOver()
        return result
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
        
        // Check if player is now bankrupt after settling the race
        this.checkGameOver()
        
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
        this.showGameOver = false
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