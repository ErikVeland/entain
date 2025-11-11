// test-betting-settlement.ts
// Test the betting settlement workflow

import { BettingEngine } from './src/game/bettingSimulator'

async function testBettingSettlement() {
  console.log('Testing betting settlement workflow...')
  
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
        },
        {
          runnerId: 'runner-3',
          number: 3,
          name: 'Test Runner 3',
          decimalOdds: 5.0
        }
      ]
    }
    
    console.log('1. Placing winning bet...')
    const winningBetId = engine.placeBet(
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
    
    console.log(`   Winning bet placed successfully with ID: ${winningBetId}`)
    
    console.log('2. Placing losing bet...')
    const losingBetId = engine.placeBet(
      raceQuote.raceId,
      raceQuote.runners[1].runnerId,
      50, // $0.50 bet
      raceQuote.runners[1].decimalOdds!,
      raceQuote.advertisedStartMs,
      raceQuote.meetingName,
      raceQuote.raceNumber,
      raceQuote.runners[1].name,
      raceQuote.categoryId
    )
    
    console.log(`   Losing bet placed successfully with ID: ${losingBetId}`)
    
    // Check bankroll after placing bets
    const bankrollAfterBets = engine.getBankroll()
    console.log(`3. Bankroll after placing bets: $${(bankrollAfterBets.balance / 100).toFixed(2)}`)
    console.log(`   Locked funds: $${(bankrollAfterBets.locked / 100).toFixed(2)}`)
    
    // Simulate race result where our winning runner comes first
    console.log('4. Settling race...')
    const result = {
      raceId: raceQuote.raceId,
      placings: [raceQuote.runners[0].runnerId, raceQuote.runners[2].runnerId, raceQuote.runners[1].runnerId],
      finishTimesMs: {
        [raceQuote.runners[0].runnerId]: Date.now() + 70000,
        [raceQuote.runners[2].runnerId]: Date.now() + 70500,
        [raceQuote.runners[1].runnerId]: Date.now() + 71000
      }
    }
    
    const settlements = engine.settleRace(result)
    console.log(`   Race settled. Settlements: ${settlements.length}`)
    
    settlements.forEach((settlement, index) => {
      console.log(`   Settlement ${index + 1}:`)
      console.log(`     Bet ID: ${settlement.betId}`)
      console.log(`     Result: ${settlement.result}`)
      console.log(`     Stake: $${(settlement.stake / 100).toFixed(2)}`)
      console.log(`     Payout: $${(settlement.payout / 100).toFixed(2)}`)
      console.log(`     Profit/Loss: $${(settlement.profitLoss / 100).toFixed(2)}`)
      console.log(`     Breakdown: ${settlement.breakdown}`)
    })
    
    // Check final bankroll
    const finalBankroll = engine.getBankroll()
    console.log(`5. Final bankroll: $${(finalBankroll.balance / 100).toFixed(2)}`)
    console.log(`   Locked funds: $${(finalBankroll.locked / 100).toFixed(2)}`)
    console.log(`   Settled profit/loss: $${(finalBankroll.settledProfitLoss / 100).toFixed(2)}`)
    
    // Verify game over condition (should not be game over since we won money)
    const isGameOver = finalBankroll.balance <= 0
    console.log(`6. Game over condition: ${isGameOver ? 'YES' : 'NO'}`)
    
    // Test with zero balance scenario
    console.log('7. Testing game over condition with zero balance...')
    const engine2 = new BettingEngine(0) // Zero balance
    
    // Try to place a bet with zero balance - should fail
    try {
      const losingBetId2 = engine2.placeBet(
        raceQuote.raceId,
        raceQuote.runners[1].runnerId,
        10, // $0.10 bet (minimum bet)
        raceQuote.runners[1].decimalOdds!,
        raceQuote.advertisedStartMs,
        raceQuote.meetingName,
        raceQuote.raceNumber,
        raceQuote.runners[1].name,
        raceQuote.categoryId
      )
      console.log('   Bet placement should have failed but did not')
    } catch (error) {
      console.log('   Bet placement correctly failed with insufficient funds')
    }
    
    // Add some funds and place a bet that will lose
    engine2.addCredits(100) // Add $1.00
    
    const losingBetId2 = engine2.placeBet(
      raceQuote.raceId,
      raceQuote.runners[1].runnerId,
      10, // $0.10 bet (minimum bet)
      raceQuote.runners[1].decimalOdds!,
      raceQuote.advertisedStartMs,
      raceQuote.meetingName,
      raceQuote.raceNumber,
      raceQuote.runners[1].name,
      raceQuote.categoryId
    )
    
    // Settle the losing bet
    const settlements2 = engine2.settleRace(result)
    const finalBankroll2 = engine2.getBankroll()
    const isGameOver2 = finalBankroll2.balance <= 0
    console.log(`   Final balance: $${(finalBankroll2.balance / 100).toFixed(2)}`)
    console.log(`   Game over condition: ${isGameOver2 ? 'YES' : 'NO'}`)
    
    console.log('✅ Betting settlement workflow test completed successfully!')
    
  } catch (error) {
    console.error('❌ Error during testing:', error)
  }
}

// Run the test
testBettingSettlement()