// simple-test.ts
// Simple test of the betting engine functionality

import { BettingEngine, DEFAULT_CONFIG } from './src/game/bettingSimulator'

async function testBettingEngine() {
  console.log('Testing betting engine functionality...')
  
  try {
    // Create a betting engine with initial bankroll
    const engine = new BettingEngine(10000) // $100 in cents
    
    // Create a mock race quote
    const raceQuote = {
      raceId: 'test-race-1',
      meetingName: 'Test Meeting',
      raceNumber: 1,
      categoryId: '4a2788f8-e825-4d36-9894-efd4baf1cfae', // Horse
      advertisedStartMs: Date.now() + 60000, // 1 minute in the future
      runners: [
        {
          runnerId: 'runner-1',
          number: 1,
          name: 'Test Runner 1',
          decimalOdds: 3.5
        },
        {
          runnerId: 'runner-2',
          number: 2,
          name: 'Test Runner 2',
          decimalOdds: 4.0
        }
      ]
    }
    
    console.log('1. Placing a bet...')
    const betId = await engine.placeBet(
      raceQuote.raceId,
      raceQuote.runners[0].runnerId,
      100, // $1.00 bet
      raceQuote.runners[0].decimalOdds!,
      raceQuote.advertisedStartMs,
      raceQuote.meetingName,
      raceQuote.raceNumber,
      raceQuote.runners[0].name,
      raceQuote.categoryId
    )
    
    console.log(`   Bet placed successfully with ID: ${betId}`)
    
    // Check bankroll after placing bet
    const bankrollAfterBet = engine.getBankroll()
    console.log(`2. Bankroll after placing bet: $${(bankrollAfterBet.balance / 100).toFixed(2)}`)
    
    // Simulate race result where our runner wins
    console.log('3. Settling race...')
    const result = {
      raceId: raceQuote.raceId,
      placings: [raceQuote.runners[0].runnerId, raceQuote.runners[1].runnerId],
      finishTimesMs: {
        [raceQuote.runners[0].runnerId]: Date.now() + 70000,
        [raceQuote.runners[1].runnerId]: Date.now() + 70500
      }
    }
    
    const settlements = engine.settleRace(result)
    console.log(`   Race settled. Settlements: ${settlements.length}`)
    
    if (settlements.length > 0) {
      console.log(`   Settlement result: ${settlements[0].result}`)
      console.log(`   Payout: $${(settlements[0].payout / 100).toFixed(2)}`)
      console.log(`   Profit/Loss: $${(settlements[0].profitLoss / 100).toFixed(2)}`)
    }
    
    // Check final bankroll
    const finalBankroll = engine.getBankroll()
    console.log(`4. Final bankroll: $${(finalBankroll.balance / 100).toFixed(2)}`)
    
    console.log('✅ Betting engine test completed successfully!')
    
  } catch (error) {
    console.error('❌ Error during testing:', error)
  }
}

// Run the test
testBettingEngine()