import { defineStore } from 'pinia'
import { SimulationBettingAdapter, ApiBettingAdapter } from '../adapters'
import type { BettingService, Settlement } from '../core/betting'
import type { Bankroll } from '../core/types'
import { persistenceManager } from '../utils/persistenceManager'

interface BetsState {
  showGame: boolean
  useSimulatedData: boolean
  showGameOver: boolean
  lastWonBetId: string | null
  service: BettingService | null
  _bankroll: Bankroll | null
  betHistory: any[] // Add bet history to store state
}

export const useBetsStore = defineStore('bets', {
  state: (): BetsState => ({
    showGame: false,
    useSimulatedData: false,
    showGameOver: false,
    lastWonBetId: null,
    // We'll store the service instance directly in state
    service: null,
    _bankroll: null,
    betHistory: [] // Initialize bet history
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
    /**
     * Initialize store with persisted state
     */
    initFromPersistence(): void {
      try {
        // Load persisted state for game mode settings (v1 schema)
        const persistedSettings = persistenceManager.load<{
          showGame: boolean;
          useSimulatedData: boolean;
        }>('bets:settings', 1);
        
        if (persistedSettings) {
          this.showGame = persistedSettings.showGame || false;
          this.useSimulatedData = persistedSettings.useSimulatedData || false;
        }
      } catch (error) {
        console.warn('Failed to initialize bets store from persistence:', error);
      }
    },

    /**
     * Persist game mode settings to localStorage
     */
    persistSettings(): void {
      try {
        const settings = {
          showGame: this.showGame,
          useSimulatedData: this.useSimulatedData
        };
        persistenceManager.save('bets:settings', settings, 1);
      } catch (error) {
        console.warn('Failed to persist settings:', error);
      }
    },

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
      // Persist the change
      this.persistSettings();
    },
    
    // Add action to toggle data mode
    setUseSimulatedData(useSimulated: boolean) {
      this.useSimulatedData = useSimulated
      this.initializeService()
      // Persist the change
      this.persistSettings();
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
    
    async placeBet(raceId: string, runnerId: string, stake: number, odds: number | 'SP', advertisedStartMs?: number, meetingName?: string, raceNumber?: number, runnerName?: string, categoryId?: string) {
      if (!this.service) {
        this.initializeService()
      }
      
      if (!this.service) {
        throw new Error('Betting service not initialized')
      }
      
      try {
        console.log('BetsStore: Placing bet with parameters', { raceId, runnerId, stake, odds, advertisedStartMs, meetingName, raceNumber, runnerName, categoryId });
        
        // In the new abstraction, we need to pass a complete BetPlacement object
        const result = await this.service.placeBet({
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
    
    async cancelBet(betId: string) {
      if (!this.service) {
        this.initializeService()
      }
      
      if (!this.service) {
        return false
      }
      
      try {
        const result = await this.service.cancelBet(betId)
        // Check if player is now bankrupt after cancelling the bet
        this.checkGameOver()
        return result
      } catch (error) {
        console.error('Error cancelling bet:', error)
        throw error
      }
    },
    
    async settleRace(raceId: string, placings: string[]) {
      if (!this.service) {
        this.initializeService()
      }
      
      if (!this.service) {
        return []
      }
      
      try {
        const settlements = await this.service.settleRace({
          raceId,
          placings
        })
        
        // Track the last won bet for animations
        const winningSettlement = settlements.find((s: Settlement) => s.result === 'WON')
        if (winningSettlement) {
          this.lastWonBetId = winningSettlement.betId
        }
        
        // Add settlements to bet history
        this.betHistory = [...this.betHistory, ...settlements]
        
        // Check if player is now bankrupt after settling the race
        this.checkGameOver()
        
        return settlements
      } catch (error) {
        console.error('Error settling race:', error)
        throw error
      }
    },
    
    // Add method to get bet history
    getBetHistory() {
      return this.betHistory
    },
    
    // Add method to clear bet history
    clearBetHistory() {
      this.betHistory = []
    },
    
    // Add reset method to reset the engine
    reset() {
      try {
        this.showGame = false
        this.useSimulatedData = false
        this.initializeService()
        this.showGameOver = false
        // Persist the reset state
        this.persistSettings();
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