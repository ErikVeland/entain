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
      'Purple Haze', 'Orange Crush', 'Yellow Submarine', 'Black Pearl', 'White Knight',
      'Pink Panther', 'Brown Bear', 'Grey Wolf', 'Turquoise Twist', 'Magenta Magic',
      'Crimson Tide', 'Azure Sky', 'Emerald City', 'Ruby Red', 'Sapphire Blue',
      'Amber Waves', 'Jade Empire', 'Onyx Black', 'Pearl Harbor', 'Diamond Dust',
      'Platinum Blonde', 'Bronze Medal', 'Copper Penny', 'Steel Magnolia', 'Iron Man',
      'Northern Dancer', 'Secretariat', 'Man o\' War', 'Seabiscuit', 'Citation',
      'Kelso', 'Dr. Fager', 'Forego', 'Affirmed', 'Seattle Slew',
      'American Pharoah', 'Justify', 'War Admiral', 'Whirlaway', 'Count Fleet',
      'Assault', 'Cigar', 'Native Dancer', 'Ruffian', 'Holy Bull',
      'Alydar', 'Personal Ensign', 'Lady\'s Secret', 'Wild Again', 'Swale',
      'Wise Dan', 'California Chrome', 'American Pharoah', 'Justify', 'Arrogate',
      'Gun Runner', 'Accelerate', 'Justify', 'American Pharoah', 'California Chrome',
      'Ghostzapper', 'Funny Cide', 'War Emblem', 'Fusaichi Pegasus', 'Charismatic',
      'Real Quiet', 'Silver Charm', 'Grindstone', 'Thunder Gulch', 'Tabasco Cat',
      'Pleasant Tap', 'Unbridled', 'Gone West', 'Sunday Silence', 'Alysheba',
      'Bet Twice', 'Proud Truth', 'Swale', 'Gulch', 'Pebbles',
      'Lightning Strike', 'Storm Chaser', 'Wind Walker', 'Fire Flash', 'Ice Breaker',
      'Earth Shaker', 'Ocean Surfer', 'Mountain Climber', 'Desert Rose', 'Forest Spirit',
      'Sky Dancer', 'Sun Beam', 'Moon Glow', 'Star Light', 'Comet Tail',
      'Thunder Clap', 'Rain Drop', 'Snow Flake', 'Flame Thrower', 'Wave Rider',
      'Stone Crusher', 'Sand Castle', 'Mist Maker', 'Fog Buster', 'Cloud Drifter',
      'Dawn Breaker', 'Twilight Sparkle', 'Midnight Shadow', 'Noon Sun', 'Evening Star',
      'Spring Breeze', 'Summer Heat', 'Autumn Leaf', 'Winter Chill', 'Seasons Change',
      'Fast Lane', 'Quick Step', 'Swift Move', 'Rapid Fire', 'Speed Demon'
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
      'Bite Club', 'Holy Sniff', 'Tracktopus Prime', 'Ruff McGraw', 'Lick James',
      'Fetchual Healing', 'Bark Wahlberg', 'Puppercut Deluxe', 'Gritty Committee', 'K9 West',
      'The Great Catsby', 'Collateral Beagle', 'Sit Happens', 'Goober Supreme', 'Fleas Navidad',
      'Tails from the Crypt', 'Walk of Shamehound', 'Sniff Happens', 'Labrathor', 'Noodle of Fortune',
      'Mr Worldwide', 'Chew Barker', 'Greyt Expectations', 'Salty Biscuit', 'Pawblo Escobark',
      'Lord of the Leashes', 'Sir Licks-A-Lot', 'No Bones About It', 'Chair Sniffer', 'Bark Twain',
      'Couch Rocket', 'Tailspin City', 'Notorious D.O.G.', 'Walk of Shamehound', 'Shake\'n\'Bacon',
      'Zoom and Gloom', 'Bite Me Maybe', 'Sofa So Fast', 'Yeet Street', 'Collieflower Power',
      'Paws and Effect', 'The Bone Collector', 'Fur Real', 'Ruff Rider', 'Canine Crusoe',
      'Hot Dog', 'Panting Panther', 'Tail Chaser', 'Biscuit Bolt', 'Muttley Crew',
      'Paw Power', 'Sniff Test', 'The Howling Command', 'Fetch Quest', 'Bark Ranger',
      'Dog Day Afternoon', 'Pawsitivity', 'The Woof Pack', 'Fur Ball', 'Ruff Trade',
      'Canine Caper', 'Tail Spin', 'Bark Side', 'Paw Print', 'Sniffle Sphere',
      'The Dogfather', 'Paws and Claws', 'Ruff Justice', 'Fur Coat', 'Biscuit Brigade',
      'Woof Warrior', 'Paw-some', 'The Bone Zone', 'Fur Real Fast', 'Tail Wind',
      'Doggy Style', 'Paws for Thought', 'Ruff Draft', 'Sniffle Snaffle', 'Bark Code',
      'Canine Commando', 'Fur-st Class', 'Paw-sition', 'The Howling Hound', 'Fetch Master'
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
      'Muscle Master', 'Traction Titan', 'Pull Paladin', 'Haul Hercules', 'Tug Thunder',
      'Brawn Bringer', 'Might Mover', 'Strength Sprinter', 'Power Punch', 'Force Fighter',
      'Vigor Victor', 'Momentum Monster', 'Drive Dominator', 'Pull Prince', 'Tug Terror',
      'Haul Hulk', 'Lift Lion', 'Drag Demon', 'Yank Yowler', 'Tow Titan',
      'Muscle Machine', 'Traction Thunder', 'Pull Panther', 'Haul Horse', 'Tug Tornado',
      'Steam Engine', 'Diesel Driver', 'Electric Express', 'Bullet Train', 'Rocket Sled',
      'Jet Propulsion', 'Turbo Thrust', 'Nitro Boost', 'Hyper Speed', 'Super Sonic',
      'Speedway Star', 'Velocity Van', 'Acceleration Ace', 'Momentum Mobile', 'Thrust Truck',
      'Propulsion Prince', 'Boost Bus', 'Hyper Horse', 'Sonic Speeder', 'Turbo Taxi',
      'Jet Jaguar', 'Nitro Navigator', 'Speedster Supreme', 'Velocity Victor', 'Acceleration Arrow',
      'Builder Bob', 'Carpenter Carl', 'Electrician Ed', 'Plumber Pete', 'Mechanic Mike',
      'Farmer Fred', 'Rancher Rick', 'Cowboy Cody', 'Sheriff Sam', 'Deputy Dan',
      'Miner Max', 'Welder Walt', 'Driver Dave', 'Pilot Pete', 'Sailor Sam',
      'Chef Charlie', 'Doctor Doug', 'Nurse Nancy', 'Teacher Tim', 'Lawyer Larry',
      'Artist Andy', 'Writer Will', 'Musician Mike', 'Actor Adam', 'Director Dan',
      'Atlas', 'Hercules', 'Samson', 'Goliath', 'Titan', 'Giant', 'Colossus', 'Behemoth',
      'Leviathan', 'Kraken', 'Juggernaut', 'Gargantua', 'Cyclops', 'Minotaur', 'Centaur',
      'Odin', 'Thor', 'Loki', 'Zeus', 'Poseidon', 'Hades', 'Ares', 'Apollo',
      'Athena', 'Artemis', 'Demeter', 'Dionysus', 'Hermes', 'Persephone', 'Hephaestus',
      'Baldur', 'Freyr', 'Heimdall', 'Tyr', 'Vidar', 'Vali', 'Ullr', 'Forseti',
      'Mountain Mover', 'River Runner', 'Forest Hauler', 'Desert Dragger', 'Ocean Tugger',
      'Glacier Grinder', 'Volcano Vaulter', 'Canyon Crusher', 'Valley Voyager', 'Prairie Puller',
      'Meadow Musher', 'Swamp Slider', 'Tundra Tugger', 'Jungle Juggler', 'Savanna Sprinter',
      'Arctic Anchor', 'Tropical Tug', 'Alpine Anchor', 'Coastal Crusher', 'Marsh Mover',
      'Steppe Strider', 'Plateau Puller', 'Basin Brawler', 'Delta Dragger', 'Estuary Express',
      'Cosmic Hauler', 'Galaxy Glider', 'Stellar Strider', 'Nebula Navigator', 'Comet Chaser',
      'Meteor Mover', 'Asteroid Anchor', 'Planet Puller', 'Star Strider', 'Orbit Operator',
      'Galactic Glider', 'Universal Usher', 'Celestial Carrier', 'Lunar Lifter', 'Solar Sailer',
      'Stellar Steerer', 'Nebular Navigator', 'Cometary Commander', 'Asteroidal Anchor', 'Planetary Puller',
      'Starry Strider', 'Orbital Operator', 'Cosmos Carrier', 'Milky Way Mover', 'Black Hole Hauler'
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