import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import BalanceWidget from '../BalanceWidget.vue'
import { useBetsStore } from '../../stores/bets'

describe('BalanceWidget', () => {
  beforeEach(() => {
    // Mock the document.addEventListener for dropdown closing
    document.addEventListener = vi.fn()
    document.removeEventListener = vi.fn()
    
    // Create a new pinia instance and make it active
    setActivePinia(createPinia())
  })

  it('renders correctly with initial state', () => {
    const store = useBetsStore()
    store.balance = 10000
    store.locked = 0
    store.transactions = []
    
    const wrapper = mount(BalanceWidget)
    
    // Check that the component renders
    expect(wrapper.exists()).toBe(true)
    
    // Check that the balance is displayed correctly
    expect(wrapper.text()).toContain('Credits')
    expect(wrapper.text()).toContain('$100.00')
  })

  it('shows dropdown when clicked', async () => {
    const store = useBetsStore()
    store.balance = 10000
    store.locked = 2000
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
    
    const wrapper = mount(BalanceWidget)
    
    // Initially dropdown should be hidden
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    
    // Click the button to show dropdown
    await wrapper.find('button').trigger('click')
    
    // Dropdown should now be visible
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
    
    // Check that the transaction is displayed
    expect(wrapper.text()).toContain('Initial credits')
  })

  it('displays correct balance information', async () => {
    const store = useBetsStore()
    store.balance = 15000
    store.locked = 3000
    store.transactions = []
    
    const wrapper = mount(BalanceWidget)
    
    // Click the button to show dropdown
    await wrapper.find('button').trigger('click')
    
    // Check that the balance information is displayed correctly
    expect(wrapper.text()).toContain('Available')
    expect(wrapper.text()).toContain('$120.00') // 15000 - 3000
    expect(wrapper.text()).toContain('Locked')
    expect(wrapper.text()).toContain('$30.00')
    expect(wrapper.text()).toContain('Total')
    expect(wrapper.text()).toContain('$150.00')
  })
})