import { describe, it, expect } from 'vitest'
import { useOddsSimulation } from '../composables/useOddsSimulation'

describe('Odds Simulation', () => {
  it('should initialize odds simulation correctly', () => {
    const { initializeOddsSimulation, getSimulatedRunners } = useOddsSimulation()
    
    const runners = [
      {
        id: 'runner-1',
        number: 1,
        name: 'Thunder Bay',
        weight: '58kg',
        jockey: 'J: R Vaibhav',
        odds: 2.40,
        oddsTrend: 'up' as const,
        silkColor: 'bg-blue-500'
      },
      {
        id: 'runner-2',
        number: 2,
        name: 'Midnight Express',
        weight: '56kg',
        jockey: 'J: Sarah Johnson',
        odds: 3.40,
        oddsTrend: 'down' as const,
        silkColor: 'bg-green-500'
      }
    ]
    
    initializeOddsSimulation('race-1', runners)
    const result = getSimulatedRunners('race-1')
    
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('runner-1')
    expect(result[0].odds).toBe(2.40)
    expect(result[1].id).toBe('runner-2')
    expect(result[1].odds).toBe(3.40)
  })
  
  it('should update odds based on race progress', () => {
    const { initializeOddsSimulation, updateOdds, getSimulatedRunners } = useOddsSimulation()
    
    const runners = [
      {
        id: 'runner-1',
        number: 1,
        name: 'Thunder Bay',
        weight: '58kg',
        jockey: 'J: R Vaibhav',
        odds: 2.40,
        oddsTrend: 'none' as const,
        silkColor: 'bg-blue-500'
      },
      {
        id: 'runner-2',
        number: 2,
        name: 'Midnight Express',
        weight: '56kg',
        jockey: 'J: Sarah Johnson',
        odds: 3.40,
        oddsTrend: 'none' as const,
        silkColor: 'bg-green-500'
      }
    ]
    
    initializeOddsSimulation('race-1', runners)
    
    // Simulate race progress where runner-1 is leading
    updateOdds('race-1', {
      'runner-1': 0.7, // 70% progress
      'runner-2': 0.6  // 60% progress
    }, ['runner-1', 'runner-2']) // runner-1 is leading
    
    const result = getSimulatedRunners('race-1')
    
    // Leader's odds should decrease (become more favorable)
    expect(result[0].id).toBe('runner-1')
    expect(typeof result[0].odds === 'number' && result[0].odds < 2.40).toBe(true)
    
    // Trailing runner's odds should increase (become less favorable)
    expect(result[1].id).toBe('runner-2')
    expect(typeof result[1].odds === 'number' && result[1].odds >= 3.40).toBe(true)
  })
})