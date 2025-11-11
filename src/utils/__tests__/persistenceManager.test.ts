import { describe, it, expect, beforeEach } from 'vitest'
import { persistenceManager } from '../persistenceManager'

describe('PersistenceManager', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  it('should save and load data with versioning', () => {
    const key = 'test-data'
    const data = { name: 'Test', value: 42 }
    const version = 1

    // Save data
    persistenceManager.save(key, data, version)
    
    // Load data
    const loadedData = persistenceManager.load<typeof data>(key, version)
    
    expect(loadedData).toEqual(data)
  })

  it('should return null for non-existent keys', () => {
    const result = persistenceManager.load('non-existent-key', 1)
    expect(result).toBeNull()
  })

  it('should handle migration for older versions', () => {
    const key = 'migratable-data'
    const oldData = { name: 'Old', value: 10 }
    const version = 2
    
    // Save old version data
    persistenceManager.save(key, oldData, 1)
    
    // Define migration function
    const migration = (data: any) => ({
      ...data,
      value: data.value * 2,
      migrated: true
    })
    
    // Load with migration
    const loadedData = persistenceManager.load(key, version, migration)
    
    expect(loadedData).toEqual({
      name: 'Old',
      value: 20,
      migrated: true
    })
  })

  it('should remove data correctly', () => {
    const key = 'removable-data'
    const data = { test: 'data' }
    
    // Save data
    persistenceManager.save(key, data, 1)
    
    // Verify it exists
    expect(persistenceManager.load(key, 1)).toEqual(data)
    
    // Remove data
    persistenceManager.remove(key)
    
    // Verify it's gone
    expect(persistenceManager.load(key, 1)).toBeNull()
  })

  it('should get last saved timestamp', () => {
    const key = 'timestamp-test'
    const data = { value: 'test' }
    
    // Save data
    persistenceManager.save(key, data, 1)
    
    // Get timestamp
    const timestamp = persistenceManager.getLastSaved(key)
    
    expect(timestamp).toBeTypeOf('number')
    expect(timestamp).toBeGreaterThan(0)
  })

  it('should handle JSON serialization errors gracefully', () => {
    const key = 'circular-data'
    const data: any = { name: 'Circular' }
    data.self = data // Circular reference
    
    // This should not throw an error
    expect(() => {
      persistenceManager.save(key, data, 1)
    }).not.toThrow()
    
    // Should return null for unserializable data
    const result = persistenceManager.load(key, 1)
    expect(result).toBeNull()
  })
})