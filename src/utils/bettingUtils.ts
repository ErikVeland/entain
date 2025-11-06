import { type BetSelection, type MarketType } from '../types/betting'

/**
 * Calculate estimated return for a bet
 * @param stake The stake amount in cents
 * @param odds The odds (number or 'SP')
 * @param market The market type
 * @returns Estimated return in cents
 */
export function calculateEstimatedReturn(stake: number, odds: number | 'SP', market: MarketType): number {
  // Ensure stake is a valid number
  const validStake = isNaN(stake) ? 0 : stake
  
  // Handle odds conversion
  let numericOdds: number
  if (odds === 'SP') {
    numericOdds = 6.0
  } else if (typeof odds === 'number') {
    numericOdds = odds
  } else {
    const parsedOdds = parseFloat(String(odds))
    numericOdds = isNaN(parsedOdds) ? 6.0 : parsedOdds
  }
  
  // Handle invalid odds
  if (isNaN(numericOdds) || numericOdds <= 0) {
    numericOdds = 6.0 // Default to SP odds
  }
  
  // Apply market modifiers
  switch (market) {
    case 'place':
      // Place bets typically pay 1/4 of win odds
      numericOdds = 1 + ((numericOdds - 1) * 0.25)
      break
    case 'each-way':
      // Each-way bets split stake between win and place
      return Math.round((validStake * numericOdds + validStake * (1 + ((numericOdds - 1) * 0.25))) / 2)
  }
  
  return Math.round(validStake * numericOdds)
}

/**
 * Validate a stake amount
 * @param stake The stake to validate
 * @returns True if the stake is valid
 */
export function isValidStake(stake: number): boolean {
  return !isNaN(stake) && stake >= 0
}