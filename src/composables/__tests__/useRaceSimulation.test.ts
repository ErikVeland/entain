import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRaceSimulation } from '../useRaceSimulation'
import { useBetsStore } from '../../stores/bets'
import { createPinia, setActivePinia } from 'pinia'

describe('useRaceSimulation', () => {
  beforeEach(() => {
    // Create a new pinia instance and make it active
    setActivePinia(createPinia())
  })

  it('creates and manages race simulations', () => {
    const store = useBetsStore()
    const { createSimulation, getSimulation, removeSimulation } = useRaceSimulation()
    
    // Create a mock race input
    const raceInput = {
      id: 'race1',
      meetingName: 'Test Meeting',
      raceNumber: 1,
      categoryId: '4a2788f8-e825-4d36-9894-efd4baf1cfae',
      advertisedStartMs: Date.now() + 60000,
      runners: [
        {
          id: 'runner1',
          number: 1,
          name: 'Test Runner 1',
          decimalOdds: 2.5
        }
      ]
    }
    
    // Create a simulation
    const controller = createSimulation(raceInput)
    
    // Check that the controller was created
    expect(controller).toBeDefined()
    
    // Check that the controller was added to the store
    expect(store.raceControllers['race1']).toBeDefined()
    
    // Get the simulation
    const retrievedController = getSimulation('race1')
    
    // Check that the controller was retrieved
    expect(retrievedController).toBeDefined()
    
    // Remove the simulation
    removeSimulation('race1')
    
    // Check that the controller was removed from the store
    expect(store.raceControllers['race1']).toBeUndefined()
  })
})