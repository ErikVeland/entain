// src/stores/bets.ts
import { defineStore } from 'pinia'
import { BettingEngine, DEFAULT_CONFIG } from '../game/bettingSimulator'

export const useBetsStore = defineStore('bets', {
  state: () => ({
    engine: new BettingEngine(1000, DEFAULT_CONFIG) as BettingEngine,
    showGame: false
  }),
  getters: {
    bankroll(state) {
      return state.engine.getBankroll()
    },
    bets(state) {
      return state.engine.listBets()
    }
  },
  actions: {
    placeBet(raceId: string, runnerId: string, amount: number, odds: number | 'SP') {
      return this.engine.placeBet(raceId, runnerId, amount, odds)
    },
    cancelBet(betId: string) {
      return this.engine.cancelBet(betId)
    },
    settleRace(raceId: string, result: { placings: string[] }) {
      this.engine.settleRace(raceId, result)
    },
    setShowGame(show: boolean) {
      this.showGame = show
    },
    reset() {
      this.engine.reset()
    }
  }
})