// src/composables/useVirtualCurrency.ts
import { ref, computed } from 'vue'
import { useBetsStore } from '../stores/bets'

// Define transaction types
export interface Transaction {
  id: string
  type: 'initial_credit' | 'bet_placed' | 'bet_cancelled' | 'bet_won' | 'bet_lost'
  amount: number
  balanceBefore: number
  balanceAfter: number
  timestamp: number
  description: string
  betId?: string
  raceId?: string
}

export function useVirtualCurrency() {
  const betsStore = useBetsStore()
  
  // Available balance (balance - locked)
  const availableBalance = computed(() => betsStore.availableBalance)
  
  // Total balance (available + locked)
  const totalBalance = computed(() => betsStore.totalBalance)
  
  // Locked balance
  const lockedBalance = computed(() => betsStore.locked)
  
  // Recent transactions
  const recentTransactions = computed(() => betsStore.recentTransactions)
  
  // Accept welcome credits
  const acceptWelcomeCredits = () => {
    betsStore.acceptWelcomeCredits()
  }
  
  // Check if welcome message should be shown
  const showWelcome = computed(() => betsStore.showWelcome)
  
  return {
    // Balance information
    availableBalance,
    totalBalance,
    lockedBalance,
    
    // Transactions
    recentTransactions,
    
    // Actions
    acceptWelcomeCredits,
    showWelcome
  }
}