import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { eventManager, EventManager } from '../eventManager'

describe('EventManager', () => {
  let testEventManager: EventManager

  beforeEach(() => {
    testEventManager = new EventManager()
  })

  afterEach(() => {
    // Clean up all listeners after each test
    testEventManager.removeAllListeners()
  })

  it('should add and remove event listeners correctly', () => {
    expect(testEventManager.getActiveListenerCount()).toBe(0)

    const element = document.createElement('div')
    const handler = () => {}

    const listenerId = testEventManager.addEventListener(element, 'click', handler)
    expect(testEventManager.getActiveListenerCount()).toBe(1)

    const removed = testEventManager.removeEventListener(listenerId)
    expect(removed).toBe(true)
    expect(testEventManager.getActiveListenerCount()).toBe(0)
  })

  it('should remove all listeners for a specific target', () => {
    const element1 = document.createElement('div')
    const element2 = document.createElement('div')
    const handler1 = () => {}
    const handler2 = () => {}
    const handler3 = () => {}

    testEventManager.addEventListener(element1, 'click', handler1)
    testEventManager.addEventListener(element1, 'mouseover', handler2)
    testEventManager.addEventListener(element2, 'click', handler3)

    expect(testEventManager.getActiveListenerCount()).toBe(3)

    testEventManager.removeAllListenersForTarget(element1)
    expect(testEventManager.getActiveListenerCount()).toBe(1)

    testEventManager.removeAllListenersForTarget(element2)
    expect(testEventManager.getActiveListenerCount()).toBe(0)
  })

  it('should remove all listeners of a specific type', () => {
    const element = document.createElement('div')
    const handler1 = () => {}
    const handler2 = () => {}
    const handler3 = () => {}

    testEventManager.addEventListener(element, 'click', handler1)
    testEventManager.addEventListener(element, 'click', handler2)
    testEventManager.addEventListener(element, 'mouseover', handler3)

    expect(testEventManager.getActiveListenerCount()).toBe(3)

    testEventManager.removeAllListenersOfType('click')
    expect(testEventManager.getActiveListenerCount()).toBe(1)
    expect(testEventManager.getActiveListenerCount()).toBe(1)

    testEventManager.removeAllListenersOfType('mouseover')
    expect(testEventManager.getActiveListenerCount()).toBe(0)
  })

  it('should remove all listeners', () => {
    const element1 = document.createElement('div')
    const element2 = document.createElement('div')
    const handler1 = () => {}
    const handler2 = () => {}
    const handler3 = () => {}

    testEventManager.addEventListener(element1, 'click', handler1)
    testEventManager.addEventListener(element2, 'mouseover', handler2)
    testEventManager.addEventListener(element1, 'keydown', handler3)

    expect(testEventManager.getActiveListenerCount()).toBe(3)

    testEventManager.removeAllListeners()
    expect(testEventManager.getActiveListenerCount()).toBe(0)
  })

  it('should return false when trying to remove non-existent listener', () => {
    const result = testEventManager.removeEventListener(999)
    expect(result).toBe(false)
  })
})