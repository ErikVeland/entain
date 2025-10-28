import { defineStore } from 'pinia'
import { BettingEngine } from '../game/bettingSimulator'
import type { BankrollSnapshot } from '../game/bettingSimulator'

export const useBetsStore = defineStore('bets', {
  state: () => ({
    showGame: false,
    useSimulatedData: false,
    engine: new BettingEngine(1000), // $1000 initial bankroll
    showGameOver: false,
    lastWonBetId: null as string | null
  }),
  
  getters: {
    bankroll(): BankrollSnapshot {
      return this.engine.getBankroll()
    }
  },
  
  actions: {
    // Add action to toggle game mode
    setShowGame(show: boolean) {
      this.showGame = show
    },
    
    // Add action to toggle data mode
    setUseSimulatedData(useSimulated: boolean) {
      this.useSimulatedData = useSimulated
    },
    
    // Method to add welcome credits (for restarting the game)
    acceptWelcomeCredits() {
      this.engine.addCredits(10000) // Add $100 in cents
    },
    
    // Method to check if game over dialog should be shown
    // Game over should only occur when balance is zero/negative AND no pending bets exist
    // AND all pending bets have been settled (lost or won)
    checkGameOver() {
      const bankroll = this.engine.getBankroll()
      const allBets = this.engine.listBets()
      const pendingBets = allBets.filter(bet => bet.status === 'PENDING')
      const settledBets = allBets.filter(bet => bet.status === 'WON' || bet.status === 'LOST' || bet.status === 'SETTLED_PARTIAL' || bet.status === 'VOID')
      
      // Game over only if:
      // 1. Bankroll is zero or negative
      // 2. No pending bets remain
      // 3. At least one bet has been settled (to avoid triggering on initial state)
      this.showGameOver = bankroll.balance <= 0 && pendingBets.length === 0 && settledBets.length > 0
    },
    
    placeBet(raceId: string, runnerId: string, stake: number, odds: number | 'SP', advertisedStartMs?: number, meetingName?: string, raceNumber?: number, runnerName?: string, categoryId?: string) {
      try {
        const result = this.engine.placeBet(raceId, runnerId, stake, odds, advertisedStartMs, meetingName, raceNumber, runnerName, categoryId)
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
    },
    
    // Add method to cashout a bet
    cashoutBet(betId: string) {
      try {
        const result = this.engine.requestCashout(betId)
        // Check if player is now bankrupt after cashing out
        this.checkGameOver()
        return result
      } catch (error) {
        console.error('Error cashing out bet:', error)
        throw error
      }
    }
  }
})