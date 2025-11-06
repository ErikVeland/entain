/**
 * Market types for betting
 */
export type MarketType = 'win' | 'place' | 'each-way'

/**
 * Status of a bet
 */
export type BetStatus = 'PENDING' | 'WON' | 'LOST' | 'SETTLED_PARTIAL' | 'VOID'

/**
 * Bet selection information
 */
export interface BetSelection {
  id: string
  raceId: string
  raceName: string
  raceNumber: number
  runnerId: string
  runnerNumber: number
  runnerName: string
  odds: number | 'SP'
  market: MarketType
  stake: number
  estimatedReturn: number
}

/**
 * Bet information
 */
export interface Bet {
  id: string
  raceId: string
  runnerId: string
  stake: number
  odds: number | 'SP'
  status: BetStatus
  payout?: number
  result?: 'WON' | 'LOST'
}