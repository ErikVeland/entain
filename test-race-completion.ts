// test-race-completion.ts
// Test the full race completion workflow in simulation mode

import { BettingEngine } from './src/game/bettingSimulator'
import { createRaceSimulation } from './src/game/simulatedRace'

async function testRaceCompletion() {
  console.log('Testing race completion workflow...')
  
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
    
    // Create race simulation
    console.log('4. Starting race simulation...')
    const raceInput = {
      id: raceQuote.raceId,
      meetingName: raceQuote.meetingName,
      raceNumber: raceQuote.raceNumber,
      categoryId: raceQuote.categoryId,
      runners: raceQuote.runners.map(r => ({
        id: r.runnerId,
        number: r.number,
        name: r.name,
        decimalOdds: r.decimalOdds ?? undefined
      }))
    }
    
    const simulation = createRaceSimulation(raceInput, 12345, 200)
    
    // Set up finish handler
    simulation.onFinish((result) => {
      console.log('5. Race finished, settling bets...')
      
      // Settle bets
      const settlements = engine.settleRace({
        raceId: result.raceId,
        placings: result.placings,
        finishTimesMs: result.finishTimesMs
      })
      
      console.log(`   Total settlements: ${settlements.length}`)
      
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
      console.log(`6. Final bankroll: $${(finalBankroll.balance / 100).toFixed(2)}`)
      console.log(`   Locked funds: $${(finalBankroll.locked / 100).toFixed(2)}`)
      console.log(`   Settled profit/loss: $${(finalBankroll.settledProfitLoss / 100).toFixed(2)}`)
      
      // Verify game over condition (should not be game over since we won money)
      const isGameOver = finalBankroll.balance <= 0
      console.log(`7. Game over condition: ${isGameOver ? 'YES' : 'NO'}`)
      
      console.log('✅ Race completion workflow test completed successfully!')
    })
    
    // Start the simulation
    simulation.start()
    
  } catch (error) {
    console.error('❌ Error during testing:', error)
  }
}

// Run the test
testRaceCompletion()