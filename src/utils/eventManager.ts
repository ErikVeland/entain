/**
 * Event Manager Utility
 * 
 * This utility provides a centralized way to manage event listeners
 * with automatic cleanup capabilities.
 */

// Type definitions
type EventListenerId = number;
type EventType = string;

interface ManagedEventListener {
  id: EventListenerId;
  target: EventTarget;
  type: EventType;
  listener: EventListener;
  options?: boolean | AddEventListenerOptions;
  cleanup: () => void;
}

class EventManager {
  private listeners: Map<EventListenerId, ManagedEventListener> = new Map();
  private nextId: number = 1;

  /**
   * Add a managed event listener
   * @param target Event target (e.g., window, document, element)
   * @param type Event type (e.g., 'click', 'resize')
   * @param listener Event listener function
   * @param options Event listener options
   * @returns Listener ID
   */
  addEventListener(
    target: EventTarget,
    type: EventType,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions
  ): EventListenerId {
    const id = this.nextId++;
    
    target.addEventListener(type, listener, options);
    
    const managedListener: ManagedEventListener = {
      id,
      target,
      type,
      listener,
      options,
      cleanup: () => {
        target.removeEventListener(type, listener, options);
      }
    };
    
    this.listeners.set(id, managedListener);
    return id;
  }

  /**
   * Remove a specific event listener
   * @param id Listener ID to remove
   */
  removeEventListener(id: EventListenerId): boolean {
    const listener = this.listeners.get(id);
    if (listener) {
      listener.cleanup();
      this.listeners.delete(id);
      return true;
    }
    return false;
  }

  /**
   * Remove all event listeners for a specific target
   * @param target Event target to remove listeners for
   */
  removeAllListenersForTarget(target: EventTarget): void {
    for (const [id, listener] of this.listeners) {
      if (listener.target === target) {
        listener.cleanup();
        this.listeners.delete(id);
      }
    }
  }

  /**
   * Remove all event listeners of a specific type
   * @param type Event type to remove listeners for
   */
  removeAllListenersOfType(type: EventType): void {
    for (const [id, listener] of this.listeners) {
      if (listener.type === type) {
        listener.cleanup();
        this.listeners.delete(id);
      }
    }
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners(): void {
    for (const listener of this.listeners.values()) {
      listener.cleanup();
    }
    this.listeners.clear();
  }

  /**
   * Get the count of active listeners
   * @returns Number of active listeners
   */
  getActiveListenerCount(): number {
    return this.listeners.size;
  }
  
  /**
   * Get all active listener IDs
   * @returns Array of active listener IDs
   */
  getActiveListenerIds(): EventListenerId[] {
    return Array.from(this.listeners.keys());
  }
}

// Create a singleton instance
const eventManager = new EventManager();

export { eventManager, EventManager };
export type { EventListenerId, EventType };