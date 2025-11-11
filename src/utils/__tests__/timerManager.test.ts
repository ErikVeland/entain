import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { timerManager, TimerManager } from '../timerManager'

describe('TimerManager', () => {
  let testTimerManager: TimerManager

  beforeEach(() => {
    testTimerManager = new TimerManager()
  })

  afterEach(() => {
    // Clean up all timers after each test
    testTimerManager.clearAllTimers()
  })

  it('should create and clear intervals correctly', () => {
    expect(testTimerManager.getActiveTimerCount()).toBe(0)

    const intervalId = testTimerManager.setInterval(() => {}, 1000)
    expect(testTimerManager.getActiveTimerCount()).toBe(1)
    expect(testTimerManager.getActiveTimerCount('interval')).toBe(1)

    const cleared = testTimerManager.clearTimer(intervalId)
    expect(cleared).toBe(true)
    expect(testTimerManager.getActiveTimerCount()).toBe(0)
  })

  it('should create and clear timeouts correctly', () => {
    expect(testTimerManager.getActiveTimerCount()).toBe(0)

    const timeoutId = testTimerManager.setTimeout(() => {}, 1000)
    expect(testTimerManager.getActiveTimerCount()).toBe(1)
    expect(testTimerManager.getActiveTimerCount('timeout')).toBe(1)

    const cleared = testTimerManager.clearTimer(timeoutId)
    expect(cleared).toBe(true)
    expect(testTimerManager.getActiveTimerCount()).toBe(0)
  })

  it('should clear all timers of a specific type', () => {
    const intervalId1 = testTimerManager.setInterval(() => {}, 1000)
    const intervalId2 = testTimerManager.setInterval(() => {}, 2000)
    const timeoutId = testTimerManager.setTimeout(() => {}, 3000)

    expect(testTimerManager.getActiveTimerCount()).toBe(3)
    expect(testTimerManager.getActiveTimerCount('interval')).toBe(2)
    expect(testTimerManager.getActiveTimerCount('timeout')).toBe(1)

    testTimerManager.clearAllTimers('interval')
    expect(testTimerManager.getActiveTimerCount()).toBe(1)
    expect(testTimerManager.getActiveTimerCount('interval')).toBe(0)
    expect(testTimerManager.getActiveTimerCount('timeout')).toBe(1)

    testTimerManager.clearAllTimers('timeout')
    expect(testTimerManager.getActiveTimerCount()).toBe(0)
  })

  it('should clear all timers', () => {
    testTimerManager.setInterval(() => {}, 1000)
    testTimerManager.setInterval(() => {}, 2000)
    testTimerManager.setTimeout(() => {}, 3000)

    expect(testTimerManager.getActiveTimerCount()).toBe(3)

    testTimerManager.clearAllTimers()
    expect(testTimerManager.getActiveTimerCount()).toBe(0)
  })

  it('should return false when trying to clear non-existent timer', () => {
    const result = testTimerManager.clearTimer(999)
    expect(result).toBe(false)
  })
})