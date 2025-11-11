/**
 * Memory Profiler Utility
 * 
 * This utility provides tools for monitoring memory usage during development
 * and detecting potential memory leaks.
 */

import { timerManager } from './timerManager';
import { eventManager } from './eventManager';

// Type definitions
interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface MemorySnapshot {
  timestamp: number;
  memory: MemoryInfo | null;
  activeTimers: number;
  activeListeners: number;
}

class MemoryProfiler {
  private snapshots: MemorySnapshot[] = [];
  private intervalId: number | null = null;

  /**
   * Get current memory information if available
   * @returns Memory information or null if not available
   */
  getMemoryInfo(): MemoryInfo | null {
    if ('memory' in performance) {
      // @ts-ignore: performance.memory is not in the standard typing
      return performance.memory as MemoryInfo;
    }
    return null;
  }

  /**
   * Take a memory snapshot
   * @returns Memory snapshot
   */
  takeSnapshot(): MemorySnapshot {
    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      memory: this.getMemoryInfo(),
      activeTimers: timerManager.getActiveTimerCount(),
      activeListeners: eventManager.getActiveListenerCount()
    };

    return snapshot;
  }

  /**
   * Start periodic memory monitoring
   * @param interval Interval in milliseconds (default: 5000ms)
   */
  startMonitoring(interval: number = 5000): void {
    if (this.intervalId) {
      this.stopMonitoring();
    }

    this.intervalId = timerManager.setInterval(() => {
      const snapshot = this.takeSnapshot();
      this.snapshots.push(snapshot);
      
      // Keep only the last 100 snapshots to prevent memory buildup
      if (this.snapshots.length > 100) {
        this.snapshots.shift();
      }
      
      // Log memory info in development mode
      // @ts-ignore
      if (import.meta.env && import.meta.env.DEV) {
        console.log('Memory Snapshot:', {
          timestamp: new Date(snapshot.timestamp).toISOString(),
          memory: snapshot.memory,
          activeTimers: snapshot.activeTimers,
          activeListeners: snapshot.activeListeners
        });
      }
    }, interval);
  }

  /**
   * Stop periodic memory monitoring
   */
  stopMonitoring(): void {
    if (this.intervalId) {
      timerManager.clearTimer(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Get memory snapshots
   * @returns Array of memory snapshots
   */
  getSnapshots(): MemorySnapshot[] {
    return [...this.snapshots];
  }

  /**
   * Clear memory snapshots
   */
  clearSnapshots(): void {
    this.snapshots = [];
  }

  /**
   * Check for potential memory leaks
   * @param threshold Memory growth threshold in bytes (default: 10MB)
   * @returns Boolean indicating if potential leak detected
   */
  checkForLeaks(threshold: number = 10 * 1024 * 1024): boolean {
    if (this.snapshots.length < 2) {
      return false;
    }

    const first = this.snapshots[0];
    const last = this.snapshots[this.snapshots.length - 1];

    if (first.memory && last.memory) {
      const growth = last.memory.usedJSHeapSize - first.memory.usedJSHeapSize;
      return growth > threshold;
    }

    return false;
  }

  /**
   * Generate a memory report
   * @returns Memory report string
   */
  generateReport(): string {
    if (this.snapshots.length === 0) {
      return 'No memory snapshots available';
    }

    const latest = this.snapshots[this.snapshots.length - 1];
    const report = [
      'Memory Profiling Report',
      '=====================',
      `Snapshots collected: ${this.snapshots.length}`,
      `Latest snapshot: ${new Date(latest.timestamp).toISOString()}`,
      latest.memory ? `Used JS Heap: ${(latest.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB` : 'Memory info not available',
      latest.memory ? `Total JS Heap: ${(latest.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB` : 'Memory info not available',
      `Active Timers: ${latest.activeTimers}`,
      `Active Listeners: ${latest.activeListeners}`,
      `Potential leak detected: ${this.checkForLeaks() ? 'Yes' : 'No'}`
    ];

    return report.join('\n');
  }
}

// Create a singleton instance
const memoryProfiler = new MemoryProfiler();

// Start monitoring in development mode
// @ts-ignore
if (import.meta.env && import.meta.env.DEV) {
  memoryProfiler.startMonitoring(10000); // Check every 10 seconds in dev
}

export { memoryProfiler, MemoryProfiler };
export type { MemoryInfo, MemorySnapshot };