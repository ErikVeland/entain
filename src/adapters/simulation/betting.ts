// src/adapters/simulation/betting.ts
// Adapter for simulation betting engine

import { BettingEngine, DEFAULT_CONFIG } from '../../simulation'
import type { BettingService } from '../../core/betting'
import type { BetPlacement, Settlement, Bankroll, RaceResult } from '../../core/types'
import type { Bet } from '../../simulation'

export class SimulationBettingAdapter implements BettingService {
  private engine: BettingEngine

  constructor(initialBankroll: number = 1000) {
    this.engine = new BettingEngine(initialBankroll, DEFAULT_CONFIG)
  }

  async placeBet(bet: BetPlacement): Promise<string> {
    return this.engine.placeBet(
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
    return this.engine.cancelBet(betId)
  }

  async settleRace(result: RaceResult): Promise<Settlement[]> {
    const simulationResult = {
      raceId: result.raceId,
      placings: result.placings,
      finishTimesMs: {} // Not available in core interface
    }
    
    const records = this.engine.settleRace(simulationResult)
    
    // Convert to core Settlement interface
    return records.map(record => ({
      betId: record.betId,
      stake: record.stake,
      result: record.result,
      payout: record.payout,
      profitLoss: record.profitLoss,
      breakdown: record.breakdown,
      settledAtMs: record.settledAtMs
    }))
  }

  getBankroll(): Bankroll {
    const snapshot = this.engine.getBankroll()
    return {
      balance: snapshot.balance,
      locked: snapshot.locked,
      settledProfitLoss: snapshot.settledProfitLoss,
      turnover: snapshot.turnover
    }
  }

  addCredits(amount: number): void {
    this.engine.addCredits(amount)
  }

  // Additional methods that are specific to the simulation but might be needed
  listBets(): Bet[] {
    return this.engine.listBets()
  }

  getPendingBetsForRace(raceId: string): Bet[] {
    return this.engine.getPendingBetsForRace(raceId)
  }

  placeSingleWin(raceId: string, runnerId: string, stake: number, meetingName: string, raceNumber: number, runnerName: string, categoryId: string, advertisedStartMs: number, odds: number | 'SP'): string {
    // Create a RaceQuote with actual race information
    const rq = {
      raceId: raceId,
      meetingName: meetingName,
      raceNumber: raceNumber,
      categoryId: categoryId,
      advertisedStartMs: advertisedStartMs,
      runners: [
        {
          runnerId: runnerId,
          number: 1, // This should be updated with actual runner data
          name: runnerName,
          decimalOdds: odds === 'SP' ? null : odds
        }
      ]
    }
    
    const betId = `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.engine.placeSingleWin(rq, runnerId, stake, betId)
    return betId
  }
}