import { describe, it, expect } from 'vitest'
import { generateRandomizedRunners } from '../composables/useOddsSimulation'

describe('Category Specific Names', () => {
  // Category IDs from test-category-ids.js
  const CATEGORY_IDS = {
    HORSE: '4a2788f8-e825-4d36-9894-efd4baf1cfae',
    GREYHOUND: '9daef0d7-bf3c-4f50-921d-8e818c60fe61',
    HARNESS: '161d9be2-e909-4326-8c2c-35ed71fb460b'
  }

  it('should generate horse-specific names for horse races', () => {
    const runners = generateRandomizedRunners('race-1', CATEGORY_IDS.HORSE)
    
    expect(runners.length).toBeGreaterThanOrEqual(8)
    expect(runners.length).toBeLessThanOrEqual(11)
    
    // Check that horse names are used
    const horseNames = [
      'Thunder Bay', 'Midnight Express', 'Desert Storm', 'Got Immunity', 'Rocket Man',
      'Silver Bullet', 'Golden Arrow', 'Blue Thunder', 'Red Lightning', 'Green Machine',
      'Northern Dancer', 'Secretariat', 'Man o\' War', 'Seabiscuit', 'Citation'
    ]
    
    // Check that jockey names are used with 'J:' prefix
    const jockeyPrefixes = runners.map(runner => runner.jockey.startsWith('J:'))
    
    expect(jockeyPrefixes.every(prefix => prefix)).toBe(true)
    
    // At least some of the runners should have recognizable horse names
    const hasHorseNames = runners.some(runner => 
      horseNames.some(horseName => runner.name.includes(horseName.split(' ')[0]))
    )
    
    expect(hasHorseNames).toBe(true)
  })

  it('should generate greyhound-specific names for greyhound races', () => {
    const runners = generateRandomizedRunners('race-2', CATEGORY_IDS.GREYHOUND)
    
    expect(runners.length).toBeGreaterThanOrEqual(8)
    expect(runners.length).toBeLessThanOrEqual(11)
    
    // Check that greyhound names are used (updated with restored names)
    const greyhoundNames = [
      'Zoomerang', 'Bark Ruffalo', 'Chasin\' Pavements', 'Greta Runberg', 'Fast and Furryous',
      'Snaccident Waiting', 'Whippet Good', 'Dogtor Strange', 'Paw Patrol Tax Fraud',
      'Bite Club', 'Holy Sniff', 'Tracktopus Prime', 'Ruff McGraw', 'Lick James'
    ]
    
    // Check that trainer names are used with 'T:' prefix
    const trainerPrefixes = runners.map(runner => runner.jockey.startsWith('T:'))
    
    expect(trainerPrefixes.every(prefix => prefix)).toBe(true)
    
    // At least some of the runners should have recognizable greyhound names
    const hasGreyhoundNames = runners.some(runner => 
      greyhoundNames.some(greyhoundName => runner.name.includes(greyhoundName.split(' ')[0]))
    )
    
    expect(hasGreyhoundNames).toBe(true)
  })

  it('should generate harness-specific names for harness races', () => {
    const runners = generateRandomizedRunners('race-3', CATEGORY_IDS.HARNESS)
    
    expect(runners.length).toBeGreaterThanOrEqual(8)
    expect(runners.length).toBeLessThanOrEqual(11)
    
    // Check that harness names are used (updated with restored names)
    const harnessNames = [
      'Power Puller', 'Strong Strider', 'Mighty Mover', 'Force Forward', 'Energy Express',
      'Vigor Voyager', 'Momentum Master', 'Drive Dynamo', 'Pull Power', 'Tug Titan',
      'Haul Hero', 'Lift Legend', 'Drag Dragon', 'Yank Yeti', 'Tow Tiger',
      'Muscle Master', 'Traction Titan', 'Pull Paladin', 'Haul Hercules', 'Tug Thunder'
    ]
    
    // Check that driver names are used with 'D:' prefix
    const driverPrefixes = runners.map(runner => runner.jockey.startsWith('D:'))
    
    expect(driverPrefixes.every(prefix => prefix)).toBe(true)
    
    // At least some of the runners should have recognizable harness names
    const hasHarnessNames = runners.some(runner => 
      harnessNames.some(harnessName => runner.name.includes(harnessName.split(' ')[0]))
    )
    
    expect(hasHarnessNames).toBe(true)
  })
})