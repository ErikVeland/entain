// src/core/types.ts
// Core abstractions that work with both API and simulation

export interface Runner {
  id: string
  number: number
  name: string
  odds: number | 'SP'
}

export interface Race {
  id: string
  meetingName: string
  raceNumber: number
  categoryId: string
  advertisedStartMs: number
  runners: Runner[]
}

export interface RaceResult {
  raceId: string
  placings: string[] // runner IDs in finishing order
}

export interface BetPlacement {
  raceId: string
  runnerId: string
  stake: number
  odds: number | 'SP'
  meetingName: string
  raceNumber: number
  runnerName: string
  categoryId: string
  advertisedStartMs: number
}

export interface Settlement {
  betId: string
  stake: number
  result: 'WON' | 'LOST' | 'VOID' | 'CASHED_OUT'
  payout: number
  profitLoss: number
  breakdown: string
  settledAtMs: number
}

export interface Bankroll {
  balance: number
  locked: number
  settledProfitLoss: number
  turnover: number
}