import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { timerManager } from '../utils/timerManager'
import { eventManager } from '../utils/eventManager'

describe('Memory Leak Fixes', () => {
  beforeEach(() => {
    // Clear all timers and listeners before each test
    timerManager.clearAllTimers()
    eventManager.removeAllListeners()
  })

  afterEach(() => {
    // Clean up after each test
    timerManager.clearAllTimers()
    eventManager.removeAllListeners()
  })

  it('should properly manage timer lifecycle', () => {
    // Initially no timers should be active
    expect(timerManager.getActiveTimerCount()).toBe(0)

    // Create some timers
    const intervalId = timerManager.setInterval(() => {}, 1000)
    const timeoutId = timerManager.setTimeout(() => {}, 2000)

    // Should now have 2 active timers
    expect(timerManager.getActiveTimerCount()).toBe(2)

    // Clear one timer
    timerManager.clearTimer(intervalId)

    // Should now have 1 active timer
    expect(timerManager.getActiveTimerCount()).toBe(1)

    // Clear the other timer
    timerManager.clearTimer(timeoutId)

    // Should now have 0 active timers
    expect(timerManager.getActiveTimerCount()).toBe(0)
  })

  it('should properly manage event listener lifecycle', () => {
    // Initially no listeners should be active
    expect(eventManager.getActiveListenerCount()).toBe(0)

    // Create a mock element and event handler
    const element = document.createElement('div')
    const handler = () => {}

    // Add an event listener
    const listenerId = eventManager.addEventListener(element, 'click', handler)

    // Should now have 1 active listener
    expect(eventManager.getActiveListenerCount()).toBe(1)

    // Remove the event listener
    eventManager.removeEventListener(listenerId)

    // Should now have 0 active listeners
    expect(eventManager.getActiveListenerCount()).toBe(0)
  })

  it('should clean up all timers and listeners', () => {
    // Create multiple timers and listeners
    timerManager.setInterval(() => {}, 1000)
    timerManager.setInterval(() => {}, 2000)
    timerManager.setTimeout(() => {}, 3000)

    const element = document.createElement('div')
    const handler1 = () => {}
    const handler2 = () => {}

    eventManager.addEventListener(element, 'click', handler1)
    eventManager.addEventListener(element, 'mouseover', handler2)

    // Should have 3 timers and 2 listeners
    expect(timerManager.getActiveTimerCount()).toBe(3)
    expect(eventManager.getActiveListenerCount()).toBe(2)

    // Clean up everything
    timerManager.clearAllTimers()
    eventManager.removeAllListeners()

    // Should have 0 timers and 0 listeners
    expect(timerManager.getActiveTimerCount()).toBe(0)
    expect(eventManager.getActiveListenerCount()).toBe(0)
  })
})