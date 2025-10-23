// src/game/bettingSimulator.ts
// Betting simulator for the racing application

export interface Runner {
  id: string
  number: number
  name: string
  odds: number | 'SP' // Starting Price (SP) or decimal odds
}

export interface Race {
  id: string
  meetingName: string
  raceNumber: number
  categoryId: string
  startTime: number
  runners: Runner[]
}

export interface Bet {
  id: string
  raceId: string
  runnerId: string
  amount: number
  odds: number | 'SP'
  status: 'pending' | 'settled' | 'cancelled'
  payout?: number
  timestamp: number
}

export interface Bankroll {
  balance: number
  locked: number // Amount locked in pending bets
  settledProfitLoss: number // Total profit/loss from settled bets
  turnover: number // Total amount wagered
}

export interface BettingConfig {
  startingBalance: number
  minBet: number
  maxBet: number
}

export const DEFAULT_CONFIG: BettingConfig = {
  startingBalance: 1000,
  minBet: 5,
  maxBet: 1000
}

export class BettingEngine {
  private bankroll: Bankroll
  private bets: Bet[]
  private config: BettingConfig

  constructor(startingBalance: number, config: BettingConfig) {
    this.bankroll = {
      balance: startingBalance,
      locked: 0,
      settledProfitLoss: 0,
      turnover: 0
    }
    this.bets = []
    this.config = config
  }

  /**
   * Place a bet on a runner in a race
   */
  placeBet(raceId: string, runnerId: string, amount: number, odds: number | 'SP'): string | null {
    // Validate bet amount
    if (amount < this.config.minBet || amount > this.config.maxBet) {
      console.error(`Bet amount must be between ${this.config.minBet} and ${this.config.maxBet}`)
      return null
    }

    // Check if user has enough balance
    if (this.bankroll.balance < amount) {
      console.error('Insufficient balance')
      return null
    }

    // Create bet
    const betId = `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const bet: Bet = {
      id: betId,
      raceId,
      runnerId,
      amount,
      odds,
      status: 'pending',
      timestamp: Date.now()
    }

    // Update bankroll
    this.bankroll.balance -= amount
    this.bankroll.locked += amount
    this.bankroll.turnover += amount

    // Add bet to list
    this.bets.push(bet)

    return betId
  }

  /**
   * Cancel a pending bet
   */
  cancelBet(betId: string): boolean {
    const betIndex = this.bets.findIndex(bet => bet.id === betId && bet.status === 'pending')
    
    if (betIndex === -1) {
      return false
    }

    const bet = this.bets[betIndex]
    
    // Update bankroll
    this.bankroll.balance += bet.amount
    this.bankroll.locked -= bet.amount
    this.bankroll.turnover -= bet.amount

    // Remove bet
    this.bets.splice(betIndex, 1)
    
    return true
  }

  /**
   * Settle a race result
   */
  settleRace(raceId: string, result: { placings: string[] }): void {
    // Find all bets for this race
    const raceBets = this.bets.filter(bet => bet.raceId === raceId && bet.status === 'pending')
    
    if (raceBets.length === 0) {
      return
    }

    // Determine winner (first place)
    const winnerId = result.placings[0]
    
    // Process each bet
    for (const bet of raceBets) {
      let payout = 0
      
      // If the bet was on the winner
      if (bet.runnerId === winnerId) {
        // Calculate payout
        if (bet.odds !== 'SP' && typeof bet.odds === 'number') {
          payout = bet.amount * bet.odds
        } else {
          // For SP, we'll use a default multiplier
          payout = bet.amount * 3 // Default 3x for SP
        }
      }
      
      // Update bet status
      bet.status = 'settled'
      bet.payout = payout
      
      // Update bankroll
      this.bankroll.balance += payout
      this.bankroll.locked -= bet.amount
      this.bankroll.settledProfitLoss += (payout - bet.amount)
    }
  }

  /**
   * Get current bankroll status
   */
  getBankroll(): Bankroll {
    return { ...this.bankroll }
  }

  /**
   * List all bets
   */
  listBets(): Bet[] {
    return [...this.bets]
  }

  /**
   * Get pending bets for a specific race
   */
  getPendingBetsForRace(raceId: string): Bet[] {
    return this.bets.filter(bet => bet.raceId === raceId && bet.status === 'pending')
  }

  /**
   * Reset the betting engine
   */
  reset(): void {
    this.bankroll = {
      balance: this.config.startingBalance,
      locked: 0,
      settledProfitLoss: 0,
      turnover: 0
    }
    this.bets = []
  }
}