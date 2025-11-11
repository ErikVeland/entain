// test-game-over.ts
// Test the game over condition when balance reaches zero after losing bets

import { BettingEngine } from './src/game/bettingSimulator'

async function testGameOverCondition() {
  console.log('Testing game over condition...')
  
  try {
    // Create a betting engine with minimal bankroll
    const engine = new BettingEngine(10) // $0.10 (minimum stake)
    
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
    
    console.log('1. Placing bet with entire bankroll...')
    const betId = engine.placeBet(
      raceQuote.raceId,
      raceQuote.runners[1].runnerId,
      10, // $0.10 bet (entire bankroll)
      raceQuote.runners[1].decimalOdds!,
      raceQuote.advertisedStartMs,
      raceQuote.meetingName,
      raceQuote.raceNumber,
      raceQuote.runners[1].name,
      raceQuote.categoryId
    )
    
    console.log(`   Bet placed successfully with ID: ${betId}`)
    
    // Check bankroll after placing bet
    const bankrollAfterBet = engine.getBankroll()
    console.log(`2. Bankroll after placing bet: $${(bankrollAfterBet.balance / 100).toFixed(2)}`)
    console.log(`   Locked funds: $${(bankrollAfterBet.locked / 100).toFixed(2)}`)
    
    // Simulate race result where our runner loses
    console.log('3. Settling race with losing result...')
    const result = {
      raceId: raceQuote.raceId,
      placings: [raceQuote.runners[0].runnerId, raceQuote.runners[1].runnerId], // Our runner comes second
      finishTimesMs: {
        [raceQuote.runners[0].runnerId]: Date.now() + 70000,
        [raceQuote.runners[1].runnerId]: Date.now() + 70500
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
    console.log(`4. Final bankroll: $${(finalBankroll.balance / 100).toFixed(2)}`)
    console.log(`   Locked funds: $${(finalBankroll.locked / 100).toFixed(2)}`)
    console.log(`   Settled profit/loss: $${(finalBankroll.settledProfitLoss / 100).toFixed(2)}`)
    
    // Verify game over condition (should be game over since balance is zero)
    const isGameOver = finalBankroll.balance <= 0
    console.log(`5. Game over condition: ${isGameOver ? 'YES' : 'NO'}`)
    
    if (isGameOver) {
      console.log('✅ Game over condition correctly triggered!')
    } else {
      console.log('❌ Game over condition should have been triggered!')
    }
    
    console.log('✅ Game over condition test completed!')
    
  } catch (error) {
    console.error('❌ Error during testing:', error)
  }
}

// Run the test
testGameOverCondition()