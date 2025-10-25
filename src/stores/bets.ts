import { defineStore } from 'pinia'
import { BettingEngine } from '../game/bettingSimulator'

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