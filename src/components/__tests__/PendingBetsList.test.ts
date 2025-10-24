import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import PendingBetsList from '../PendingBetsList.vue'
import { useBetsStore } from '../../stores/bets'

describe('PendingBetsList', () => {
  const mockBets = [
    {
      id: 'bet1',
      raceId: 'race1',
      runnerId: 'runner1',
      amount: 1000, // $10.00
      odds: 2.5,
      status: 'pending' as const,
      timestamp: Date.now()
    },
    {
      id: 'bet2',
      raceId: 'race2',
      runnerId: 'runner2',
      amount: 2000, // $20.00
      odds: 'SP',
      status: 'pending' as const,
      timestamp: Date.now()
    }
  ]

  beforeEach(() => {
    // Create a new pinia instance and make it active
    setActivePinia(createPinia())
  })

  it('renders correctly with bets data', () => {
    const wrapper = mount(PendingBetsList, {
      props: {
        bets: mockBets
      }
    })
    
    // Check that the component renders
    expect(wrapper.exists()).toBe(true)
    
    // Check that the bets are displayed
    expect(wrapper.findAll('[role="region"]')).toHaveLength(2)
    
    // Check that the first bet details are displayed
    expect(wrapper.text()).toContain('$10.00')
    expect(wrapper.text()).toContain('2.50')
    expect(wrapper.text()).toContain('Pending')
    
    // Check that the second bet details are displayed
    expect(wrapper.text()).toContain('$20.00')
    expect(wrapper.text()).toContain('SP')
  })

  it('calls cancelBet when cancel button is clicked', async () => {
    const store = useBetsStore()
    store.cancelBet = vi.fn()
    
    const wrapper = mount(PendingBetsList, {
      props: {
        bets: mockBets
      }
    })
    
    // Click the cancel button for the first bet
    await wrapper.find('button').trigger('click')
    
    // Check that cancelBet was called with the correct bet ID
    expect(store.cancelBet).toHaveBeenCalledWith('bet1')
  })
})