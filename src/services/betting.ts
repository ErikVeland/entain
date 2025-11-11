// src/services/betting.ts
// Service layer for betting functionality that abstracts API vs simulation

import { useBetsStore } from '../stores/bets'
import type { BetPlacement, Settlement, Bankroll } from '../core/types'

class BettingService {
  private store = useBetsStore()

  async placeBet(bet: BetPlacement): Promise<string> {
    return this.store.placeBet(
      bet.raceId,
      bet.runnerId,
      bet.stake,
      bet.odds,
      bet.advertisedStartMs,
      bet.meetingName,
      bet.raceNumber,
      bet.runnerName,
      bet.categoryId
    )
  }

  async cancelBet(betId: string): Promise<boolean> {
    return this.store.cancelBet(betId)
  }

  async settleRace(raceId: string, placings: string[]): Promise<Settlement[]> {
    return this.store.settleRace(raceId, placings)
  }

  getBankroll(): Bankroll {
    return this.store.bankroll
  }

  addCredits(amount: number): void {
    this.store.acceptWelcomeCredits()
  }

  // Additional methods that might be needed by components
  setShowGame(show: boolean): void {
    this.store.setShowGame(show)
  }

  setUseSimulatedData(useSimulated: boolean): void {
    this.store.setUseSimulatedData(useSimulated)
  }

  getPendingBetsForRace(raceId: string): any[] {
    // Access the service directly to get pending bets
    if (this.store.service && 'getPendingBetsForRace' in this.store.service) {
      // @ts-ignore
      return this.store.service.getPendingBetsForRace(raceId)
    }
    return []
  }
  
  getBetHistory(): any[] {
    return this.store.getBetHistory()
  }
}

// Export a singleton instance
export const bettingService = new BettingService()