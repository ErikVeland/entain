import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useBetsStore } from '../stores/bets'
import BetslipDrawer from '../components/BetslipDrawer.vue'

// Mock the AudioContext for testing
const mockAudioContext = {
  createBuffer: vi.fn(),
  decodeAudioData: vi.fn(),
  createBufferSource: vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null
  })),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: { setValueAtTime: vi.fn() }
  })),
  destination: {}
}

describe('BetslipDrawer Bet History', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
    
    // Mock window.AudioContext
    Object.defineProperty(window, 'AudioContext', {
      writable: true,
      value: vi.fn(() => mockAudioContext)
    })
    
    Object.defineProperty(window, 'webkitAudioContext', {
      writable: true,
      value: vi.fn(() => mockAudioContext)
    })
  })

  it('should display bet history correctly', async () => {
    const wrapper = mount(BetslipDrawer, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              bets: {
                betHistory: [
                  {
                    betId: 'bet1',
                    type: 'WIN',
                    stake: 1000,
                    result: 'WON',
                    payout: 2500,
                    profitLoss: 1500,
                    breakdown: 'WIN @ 2.50',
                    settledAtMs: Date.now()
                  }
                ]
              }
            }
          })
        ]
      }
    })

    // Check that the bet history tab is rendered (third button)
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(3)
    const historyTab = buttons[2]
    expect(historyTab.text()).toContain('History')
    
    // Click on the history tab
    await historyTab.trigger('click')
    
    // Check that the bet history is displayed
    expect(wrapper.find('.bg-surface.rounded-xl.p-4.shadow-card').exists()).toBe(true)
  })
})