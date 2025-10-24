import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useVirtualCurrency } from '../useVirtualCurrency'
import { useBetsStore } from '../../stores/bets'
import { createPinia, setActivePinia } from 'pinia'

describe('useVirtualCurrency', () => {
  beforeEach(() => {
    // Create a new pinia instance and make it active
    setActivePinia(createPinia())
  })

  it('returns correct balance information', () => {
    const store = useBetsStore()
    store.balance = 15000
    store.locked = 3000
    store.transactions = [
      {
        id: 'tx1',
        type: 'initial_credit',
        amount: 10000,
        balanceBefore: 0,
        balanceAfter: 10000,
        timestamp: Date.now(),
        description: 'Initial credits'
      }
    ]
    
    const { availableBalance, totalBalance, lockedBalance, recentTransactions } = useVirtualCurrency()
    
    // Check that the balance information is correct
    expect(availableBalance.value).toBe(12000) // 15000 - 3000
    expect(totalBalance.value).toBe(15000)
    expect(lockedBalance.value).toBe(3000)
    
    // Check that the recent transactions are correct
    expect(recentTransactions.value).toHaveLength(1)
    expect(recentTransactions.value[0].description).toBe('Initial credits')
  })

  it('accepts welcome credits correctly', () => {
    const store = useBetsStore()
    store.showWelcome = true
    
    const { acceptWelcomeCredits, showWelcome } = useVirtualCurrency()
    
    // Check that showWelcome is true initially
    expect(showWelcome.value).toBe(true)
    
    // Call acceptWelcomeCredits
    acceptWelcomeCredits()
    
    // Check that the store state was updated
    expect(store.showWelcome).toBe(false)
  })
})