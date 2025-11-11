import { defineStore } from 'pinia'
import { SimulationBettingAdapter, ApiBettingAdapter } from '../adapters'
import type { BettingService } from '../core/betting'
import type { Bankroll } from '../core/types'

interface BetsState {
  showGame: boolean
  useSimulatedData: boolean
  showGameOver: boolean
  lastWonBetId: string | null
  service: BettingService | null
}

export const useBetsStore = defineStore('bets', {
  state: (): BetsState => ({
    showGame: false,
    useSimulatedData: false,
    showGameOver: false,
    lastWonBetId: null,
    // We'll store the service instance directly in state
    service: null
  }),
  
  getters: {
    bankroll(): Bankroll {
      // @ts-ignore
      const service = this.service as BettingService | null
      return service?.getBankroll() || {
        balance: 0,
        locked: 0,
        settledProfitLoss: 0,
        turnover: 0
      }
    }
  },
  
  actions: {
    // Initialize the betting service based on mode
    initializeService() {
      if (this.showGame && this.useSimulatedData) {
        this.service = new SimulationBettingAdapter(1000)
      } else {
        this.service = new ApiBettingAdapter()
      }
    },
    
    // Add action to toggle game mode
    setShowGame(show: boolean) {
      this.showGame = show
      this.initializeService()
    },
    
    // Add action to toggle data mode
    setUseSimulatedData(useSimulated: boolean) {
      this.useSimulatedData = useSimulated
      this.initializeService()
    },
    
    // Method to add welcome credits (for restarting the game)
    acceptWelcomeCredits() {
      this.service?.addCredits(10000) // Add $100 in cents
    },
    
    // Method to check if game over dialog should be shown
    checkGameOver() {
      if (!this.service) return
      
      const bankroll = this.service.getBankroll()
      // For now, we'll simplify this check as we don't have access to listBets
      this.showGameOver = bankroll.balance <= 0
    },
    
    placeBet(raceId: string, runnerId: string, stake: number, odds: number | 'SP', advertisedStartMs?: number, meetingName?: string, raceNumber?: number, runnerName?: string, categoryId?: string) {
      if (!this.service) {
        this.initializeService()
      }
      
      try {
        console.log('BetsStore: Placing bet with parameters', { raceId, runnerId, stake, odds, advertisedStartMs, meetingName, raceNumber, runnerName, categoryId });
        
        // In the new abstraction, we need to pass a complete BetPlacement object
        const result = this.service.placeBet({
          raceId,
          runnerId,
          stake,
          odds,
          meetingName: meetingName || '',
          raceNumber: raceNumber || 0,
          runnerName: runnerName || '',
          categoryId: categoryId || '',
          advertisedStartMs: advertisedStartMs || Date.now() + 60000 // Default to 1 minute in future
        })
        
        console.log('BetsStore: Bet placed successfully with result', result);
        // Check if player is now bankrupt after placing the bet
        this.checkGameOver()
        return result
      } catch (error) {
        console.error('Error placing bet:', error)
        throw error
      }
    },
    
    cancelBet(betId: string) {
      if (!this.service) return false
      
      try {
        const result = this.service.cancelBet(betId)
        // Check if player is now bankrupt after cancelling the bet
        this.checkGameOver()
        return result
      } catch (error) {
        console.error('Error cancelling bet:', error)
        throw error
      }
    },
    
    settleRace(raceId: string, placings: string[]) {
      if (!this.service) return []
      
      try {
        const settlements = this.service.settleRace({
          raceId,
          placings
        })
        
        // Track the last won bet for animations
        const winningSettlement = settlements.find((s: any) => s.result === 'WON')
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
        this.initializeService()
        this.showGameOver = false
      } catch (error) {
        console.error('Error resetting engine:', error)
        throw error
      }
    },
    
    // Add method to cashout a bet (simplified)
    cashoutBet(betId: string) {
      // In the new abstraction, cashout would need to be implemented
      console.log('Cashout not implemented in new abstraction')
      this.checkGameOver()
      return false
    }
  }
})