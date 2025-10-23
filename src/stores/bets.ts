// src/stores/bets.ts
import { defineStore } from 'pinia'
import { BettingEngine, DEFAULT_CONFIG } from '../game/bettingSimulator'

export const useBetsStore = defineStore('bets', {
	state: () => ({
		engine: new BettingEngine(1000, DEFAULT_CONFIG),
		bankroll: { balance: 1000, locked: 0, settledProfitLoss: 0, turnover: 0 },
		bets: []
	}),
	actions: {
		refresh() {
			this.bankroll = this.engine.getBankroll()
			this.bets = this.engine.listBets()
		},
		settle(result) {
			this.engine.settleRace(result)
			this.refresh()
		}
	}
})
