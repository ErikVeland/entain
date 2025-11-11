// test-betting-lifecycle.ts
// Test the full ingest API to bet return lifecycle

import { useRacesStore } from './src/stores/races'
import { useBetsStore } from './src/stores/bets'
import { createPinia } from 'pinia'

async function testBettingLifecycle() {
  console.log('Testing full ingest API to bet return lifecycle...')
  
  // Initialize Pinia
  const pinia = createPinia()
  
  // Get stores
  const racesStore = useRacesStore(pinia)
  const betsStore = useBetsStore(pinia)
  
  try {
    // 1. Fetch races from API (ingest)
    console.log('1. Fetching races from API...')
    await racesStore.fetchRaces()
    console.log(`   Fetched ${racesStore.races.length} races`)
    
    if (racesStore.races.length === 0) {
      console.log('   No races available for testing')
      return
    }
    
    // 2. Initialize betting service
    console.log('2. Initializing betting service...')
    betsStore.setShowGame(true)
    betsStore.setUseSimulatedData(true)
    betsStore.initializeService()
    
    // 3. Place a bet
    console.log('3. Placing a bet...')
    const race = racesStore.races[0]
    console.log(`   Selected race: ${race.meeting_name} R${race.race_number}`)
    
    // For testing, we'll use simulated runners since we don't have the full runner data
    const runnerId = 'test-runner-1'
    const runnerName = 'Test Runner'
    
    const betResult = await betsStore.placeBet(
      race.id,
      runnerId,
      100, // 100 cents = $1.00
      5.0, // odds
      race.advertised_start_ms,
      race.meeting_name,
      race.race_number,
      runnerName,
      race.category_id
    )
    
    console.log(`   Bet placed successfully with ID: ${betResult}`)
    
    // 4. Verify bankroll update
    console.log('4. Checking bankroll...')
    const bankroll = betsStore.bankroll
    console.log(`   Bankroll: $${(bankroll.balance / 100).toFixed(2)}`)
    
    // 5. Simulate race settlement
    console.log('5. Settling race...')
    const settlementResult = await betsStore.settleRace(race.id, [runnerId, 'other-runner-2', 'other-runner-3'])
    
    console.log(`   Race settled. Settlements: ${settlementResult.length}`)
    if (settlementResult.length > 0) {
      console.log(`   First settlement result: ${settlementResult[0].result}`)
      console.log(`   Profit/Loss: $${(settlementResult[0].profitLoss / 100).toFixed(2)}`)
    }
    
    // 6. Check final bankroll
    console.log('6. Checking final bankroll...')
    const finalBankroll = betsStore.bankroll
    console.log(`   Final bankroll: $${(finalBankroll.balance / 100).toFixed(2)}`)
    
    console.log('✅ Full ingest API to bet return lifecycle test completed successfully!')
    
  } catch (error) {
    console.error('❌ Error during testing:', error)
  }
}

// Run the test
testBettingLifecycle()