/**
 * Timer Manager Utility
 * 
 * This utility provides a centralized way to manage intervals and timeouts
 * with automatic cleanup capabilities.
 */

// Type definitions
type TimerId = number;
type TimerType = 'interval' | 'timeout';

interface ManagedTimer {
  id: TimerId;
  type: TimerType;
  cleanup: () => void;
}

class TimerManager {
  private timers: Map<TimerId, ManagedTimer> = new Map();
  private nextId: number = 1;

  /**
   * Create a managed interval
   * @param handler Function to execute
   * @param timeout Interval time in milliseconds
   * @returns Timer ID
   */
  setInterval(handler: () => void, timeout: number): TimerId {
    const id = this.nextId++;
    const intervalId = window.setInterval(handler, timeout);
    
    const managedTimer: ManagedTimer = {
      id,
      type: 'interval',
      cleanup: () => {
        window.clearInterval(intervalId);
      }
    };
    
    this.timers.set(id, managedTimer);
    return id;
  }

  /**
   * Create a managed timeout
   * @param handler Function to execute
   * @param timeout Timeout time in milliseconds
   * @returns Timer ID
   */
  setTimeout(handler: () => void, timeout: number): TimerId {
    const id = this.nextId++;
    const timeoutId = window.setTimeout(handler, timeout);
    
    const managedTimer: ManagedTimer = {
      id,
      type: 'timeout',
      cleanup: () => {
        window.clearTimeout(timeoutId);
      }
    };
    
    this.timers.set(id, managedTimer);
    return id;
  }

  /**
   * Clear a specific timer
   * @param id Timer ID to clear
   */
  clearTimer(id: TimerId): boolean {
    const timer = this.timers.get(id);
    if (timer) {
      timer.cleanup();
      this.timers.delete(id);
      return true;
    }
    return false;
  }

  /**
   * Clear all timers of a specific type
   * @param type Timer type to clear
   */
  clearAllTimers(type?: TimerType): void {
    for (const [id, timer] of this.timers) {
      if (!type || timer.type === type) {
        timer.cleanup();
        this.timers.delete(id);
      }
    }
  }

  /**
   * Get the count of active timers
   * @param type Timer type to count (optional)
   * @returns Number of active timers
   */
  getActiveTimerCount(type?: TimerType): number {
    if (!type) {
      return this.timers.size;
    }
    
    let count = 0;
    for (const timer of this.timers.values()) {
      if (timer.type === type) {
        count++;
      }
    }
    return count;
  }
  
  /**
   * Get all active timer IDs
   * @returns Array of active timer IDs
   */
  getActiveTimerIds(): TimerId[] {
    return Array.from(this.timers.keys());
  }
}

// Create a singleton instance
const timerManager = new TimerManager();

export { timerManager, TimerManager };
export type { TimerId, TimerType };