import { defineStore } from 'pinia'
import { SimulationBettingAdapter, ApiBettingAdapter } from '../adapters'
import type { BettingService } from '../core/betting'
import type { Bankroll } from '../core/types'

export const useBetsStore = defineStore('bets', {
  state: () => ({
    showGame: false,
    useSimulatedData: false,
    showGameOver: false,
    lastWonBetId: null as string | null,
    // We'll store the service instance directly in state
    service: null as BettingService | null
  }),
  
  getters: {
    bankroll(): Bankroll {
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
      const state = this as any
      if (state.showGame && state.useSimulatedData) {
        state.service = new SimulationBettingAdapter(1000)
      } else {
        state.service = new ApiBettingAdapter()
      }
    },
    
    // Add action to toggle game mode
    setShowGame(show: boolean) {
      const state = this as any
      state.showGame = show
      this.initializeService()
    },
    
    // Add action to toggle data mode
    setUseSimulatedData(useSimulated: boolean) {
      const state = this as any
      state.useSimulatedData = useSimulated
      this.initializeService()
    },
    
    // Method to add welcome credits (for restarting the game)
    acceptWelcomeCredits() {
      const state = this as any
      state.service?.addCredits(10000) // Add $100 in cents
    },
    
    // Method to check if game over dialog should be shown
    checkGameOver() {
      const state = this as any
      if (!state.service) return
      
      const bankroll = state.service.getBankroll()
      // For now, we'll simplify this check as we don't have access to listBets
      state.showGameOver = bankroll.balance <= 0
    },
    
    placeBet(raceId: string, runnerId: string, stake: number, odds: number | 'SP', advertisedStartMs?: number, meetingName?: string, raceNumber?: number, runnerName?: string, categoryId?: string) {
      const state = this as any
      if (!state.service) {
        this.initializeService()
      }
      
      try {
        console.log('BetsStore: Placing bet with parameters', { raceId, runnerId, stake, odds, advertisedStartMs, meetingName, raceNumber, runnerName, categoryId });
        
        // In the new abstraction, we need to pass a complete BetPlacement object
        const result = state.service.placeBet({
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
      const state = this as any
      if (!state.service) return false
      
      try {
        const result = state.service.cancelBet(betId)
        // Check if player is now bankrupt after cancelling the bet
        this.checkGameOver()
        return result
      } catch (error) {
        console.error('Error cancelling bet:', error)
        throw error
      }
    },
    
    settleRace(raceId: string, placings: string[]) {
      const state = this as any
      if (!state.service) return []
      
      try {
        const settlements = state.service.settleRace({
          raceId,
          placings
        })
        
        // Track the last won bet for animations
        const winningSettlement = settlements.find(s => s.result === 'WON')
        if (winningSettlement) {
          state.lastWonBetId = winningSettlement.betId
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
        const state = this as any
        state.showGameOver = false
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