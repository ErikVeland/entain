/**
 * Persistence Manager Utility
 * 
 * This utility provides a centralized way to manage localStorage persistence
 * with automatic schema versioning and migration capabilities.
 */

// Type definitions
type SchemaVersion = number;
type MigrationFunction<T> = (data: any) => T;

interface PersistedData<T> {
  version: SchemaVersion;
  data: T;
  timestamp: number;
}

class PersistenceManager {
  /**
   * Save data to localStorage with schema versioning
   * @param key Storage key
   * @param data Data to persist
   * @param version Schema version (default: 1)
   */
  save<T>(key: string, data: T, version: SchemaVersion = 1): void {
    try {
      const persistedData: PersistedData<T> = {
        version,
        data,
        timestamp: Date.now()
      };
      
      localStorage.setItem(key, JSON.stringify(persistedData));
    } catch (error) {
      console.warn(`Failed to persist data for key "${key}":`, error);
    }
  }

  /**
   * Load data from localStorage with optional migration
   * @param key Storage key
   * @param version Current schema version
   * @param migration Optional migration function for older versions
   * @returns Persisted data or null if not found/invalid
   */
  load<T>(key: string, version: SchemaVersion = 1, migration?: MigrationFunction<T>): T | null {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const persistedData: PersistedData<T> = JSON.parse(stored);
      
      // If versions match, return data directly
      if (persistedData.version === version) {
        return persistedData.data;
      }
      
      // If migration function is provided and stored version is older, migrate
      if (migration && persistedData.version < version) {
        const migratedData = migration(persistedData.data);
        // Save migrated data with new version
        this.save(key, migratedData, version);
        return migratedData;
      }
      
      // If stored version is newer, we can't handle it
      if (persistedData.version > version) {
        console.warn(`Stored data for "${key}" has newer version (${persistedData.version}) than expected (${version})`);
        return null;
      }
      
      return persistedData.data;
    } catch (error) {
      console.warn(`Failed to load persisted data for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Remove data from localStorage
   * @param key Storage key
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove persisted data for key "${key}":`, error);
    }
  }

  /**
   * Clear all persisted data
   */
  clearAll(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear all persisted data:', error);
    }
  }

  /**
   * Get the timestamp when data was last saved
   * @param key Storage key
   * @returns Timestamp or null if not found
   */
  getLastSaved(key: string): number | null {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const persistedData: PersistedData<any> = JSON.parse(stored);
      return persistedData.timestamp;
    } catch (error) {
      console.warn(`Failed to get last saved timestamp for key "${key}":`, error);
      return null;
    }
  }
}

// Create a singleton instance
const persistenceManager = new PersistenceManager();

export { persistenceManager, PersistenceManager };
export type { SchemaVersion, MigrationFunction, PersistedData };