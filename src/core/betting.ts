// src/core/betting.ts
// Core betting abstractions that work with both API and simulation

import type { 
  BetPlacement, 
  Settlement, 
  Bankroll,
  RaceResult
} from './types'

export interface BettingService {
  placeBet(bet: BetPlacement): Promise<string>
  cancelBet(betId: string): Promise<boolean>
  settleRace(result: RaceResult): Promise<Settlement[]>
  getBankroll(): Bankroll
  addCredits(amount: number): void
}