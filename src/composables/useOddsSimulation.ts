// src/composables/useOddsSimulation.ts
import { ref, Ref, watch } from 'vue'
import { type RunnerInput } from '../game/simulatedRace'

// Define the odds trend types
export type OddsTrend = 'up' | 'down' | 'none'

// Define a runner with simulated odds
export interface SimulatedRunner {
  id: string
  number: number
  name: string
  weight: string
  jockey: string
  odds: number | 'SP' // Changed back to number | 'SP' to match expected interface
  oddsTrend: OddsTrend
  silkColor: string
  bestTime?: string
}

// Define odds simulation state
interface OddsSimulationState {
  runners: Record<string, SimulatedRunner>
  lastUpdate: number
}

// Create a singleton instance of the simulation state
const simulations = ref<Record<string, OddsSimulationState>>({})

// Horse jockey names
const horseJockeyNames = [
  'J: R Vaibhav', 'J: Sarah Johnson', 'J: Michael Chen', 'J: Emma Wilson',
  'J: David Thompson', 'J: Lisa Anderson', 'J: James Parker', 'J: Olivia Smith',
  'J: Robert King', 'J: Jennifer Lee', 'J: William Wright', 'J: Amanda Clark',
  'J: Thomas Brown', 'J: Margaret Davis', 'J: Christopher Wilson', 'J: Patricia Miller',
  'J: Daniel Taylor', 'J: Linda Martinez', 'J: Matthew Anderson', 'J: Barbara Thomas',
  'J: Anthony Garcia', 'J: Susan Rodriguez', 'J: Mark Wilson', 'J: Betty Lopez',
  'J: Paul Martinez', 'J: Dorothy Hernandez', 'J: Steven Gonzalez', 'J: Helen Perez',
  'J: Andrew Taylor', 'J: Carol Jackson', 'J: Kenneth Moore', 'J: Ruth Martin',
  'J: Joshua Lee', 'J: Sharon Thompson', 'J: Kevin White', 'J: Catherine Harris'
]

// Human names for harness drivers (RESTORED - these were deleted in commit f0335b40f2f58000cde43823a66d1c16105584cd)
// DOUBLED with equally creative names
const harnessDriverNames = [
  'D: Robert Mitchell', 'D: Jennifer Taylor', 'D: William Brown', 'D: Amanda Davis',
  'D: Christopher Wilson', 'D: Stephanie Moore', 'D: Matthew Anderson', 'D: Nicole Thomas',
  'D: Daniel Jackson', 'D: Michelle White', 'D: Anthony Harris', 'D: Jessica Martin',
  'D: David Thompson', 'D: Sarah Johnson', 'D: James Parker', 'D: Emily Clark',
  'D: Michael Chen', 'D: Lisa Anderson', 'D: John Wilson', 'D: Mary Davis',
  'D: Richard Martinez', 'D: Linda Rodriguez', 'D: Charles Hernandez', 'D: Patricia Lopez',
  'D: Joseph Gonzalez', 'D: Barbara Perez', 'D: Thomas Taylor', 'D: Susan Jackson',
  'D: Christopher Lee', 'D: Margaret Thompson', 'D: Daniel White', 'D: Dorothy Harris',
  'D: Matthew Martin', 'D: Lisa Garcia', 'D: Anthony Martinez', 'D: Karen Rodriguez',
  // Additional creative driver names
  'D: Alexander Cooper', 'D: Victoria Stewart', 'D: Benjamin Foster', 'D: Natalie Bryant',
  'D: Samuel Reed', 'D: Elizabeth Ward', 'D: Jonathan Hayes', 'D: Sophia Myers',
  'D: Andrew Fisher', 'D: Isabella Gibson', 'D: Matthew Hunt', 'D: Charlotte Palmer',
  'D: David Russell', 'D: Amelia Phillips', 'D: Christopher Perry', 'D: Olivia Jenkins',
  'D: Joseph Powell', 'D: Emily Kelly', 'D: William Sanders', 'D: Mia Butler',
  'D: Daniel Simmons', 'D: Abigail Barnes', 'D: Michael Henderson', 'D: Charlotte Coleman',
  'D: Ethan Morgan', 'D: Harper Ross', 'D: Alexander Powell', 'D: Evelyn Reed',
  'D: Sebastian Bell', 'D: Scarlett Hughes', 'D: Jackson Foster', 'D: Grace Murphy',
  'D: Aiden Cooper', 'D: Chloe Ward', 'D: Lucas Perry', 'D: Penelope Hayes'
]

// Creative greyhound names (RESTORED - these were deleted in commit f0335b40f2f58000cde43823a66d1c16105584cd)
// DOUBLED with equally creative names
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
  // Additional creative greyhound names
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

// Horse weights (in kg) (RESTORED - these were deleted in commit f0335b40f2f58000cde43823a66d1c16105584cd)
// DOUBLED with realistic weights
const horseWeights = [
  '55kg', '56kg', '57kg', '58kg', '59kg', '60kg', '61kg', '62kg', 
  '54kg', '63kg', '53kg', '64kg', '52kg', '65kg', '51kg', '66kg',
  // Additional realistic horse weights
  '50kg', '67kg', '52kg', '65kg', '54kg', '63kg', '56kg', '61kg',
  '58kg', '59kg', '60kg', '57kg', '62kg', '55kg', '64kg', '53kg'
]

// Greyhound best times (in seconds) (RESTORED - these were deleted in commit f0335b40f2f58000cde43823a66d1c16105584cd)
// DOUBLED with realistic times
const greyhoundBestTimes = [
  '29.56s', '30.12s', '31.04s', '29.87s', '30.45s', '31.23s', '29.98s', '30.67s', 
  '29.76s', '30.34s', '31.12s', '29.91s', '30.23s', '31.45s', '29.67s', '30.78s',
  '30.01s', '31.34s', '29.89s', '30.56s', '31.01s', '29.78s', '30.89s', '31.22s',
  '30.15s', '31.56s', '29.82s', '30.63s', '31.09s', '29.94s', '30.71s', '31.33s',
  '30.08s', '31.41s', '29.73s', '30.52s', '31.18s', '29.85s', '30.69s', '31.27s',
  // Additional realistic greyhound times
  '29.65s', '30.21s', '31.13s', '29.97s', '30.54s', '31.32s', '29.88s', '30.76s',
  '30.11s', '31.24s', '29.81s', '30.43s', '31.02s', '29.77s', '30.68s', '31.44s',
  '30.03s', '31.31s', '29.83s', '30.51s', '31.08s', '29.79s', '30.81s', '31.21s',
  '30.18s', '31.51s', '29.85s', '30.61s', '31.05s', '29.91s', '30.73s', '31.38s'
]

// More creative and realistic harness names based on real examples (RESTORED - these were deleted in commit f0335b40f2f58000cde43823a66d1c16105584cd)
// DOUBLED with equally creative names in all categories
const harnessNames = [
  // Strength/power themed
  'Power Puller', 'Strong Strider', 'Mighty Mover', 'Force Forward', 'Energy Express',
  'Vigor Voyager', 'Momentum Master', 'Drive Dynamo', 'Pull Power', 'Tug Titan',
  'Haul Hero', 'Lift Legend', 'Drag Dragon', 'Yank Yeti', 'Tow Tiger',
  'Muscle Master', 'Traction Titan', 'Pull Paladin', 'Haul Hercules', 'Tug Thunder',
  // Additional strength/power themed names
  'Brawn Bringer', 'Might Mover', 'Strength Sprinter', 'Power Punch', 'Force Fighter',
  'Vigor Victor', 'Momentum Monster', 'Drive Dominator', 'Pull Prince', 'Tug Terror',
  'Haul Hulk', 'Lift Lion', 'Drag Demon', 'Yank Yowler', 'Tow Titan',
  'Muscle Machine', 'Traction Thunder', 'Pull Panther', 'Haul Horse', 'Tug Tornado',
  
  // Transportation themed
  'Steam Engine', 'Diesel Driver', 'Electric Express', 'Bullet Train', 'Rocket Sled',
  'Jet Propulsion', 'Turbo Thrust', 'Nitro Boost', 'Hyper Speed', 'Super Sonic',
  // Additional transportation themed names
  'Speedway Star', 'Velocity Van', 'Acceleration Ace', 'Momentum Mobile', 'Thrust Truck',
  'Propulsion Prince', 'Boost Bus', 'Hyper Horse', 'Sonic Speeder', 'Turbo Taxi',
  'Jet Jaguar', 'Nitro Navigator', 'Speedster Supreme', 'Velocity Victor', 'Acceleration Arrow',
  
  // Work/occupation themed
  'Builder Bob', 'Carpenter Carl', 'Electrician Ed', 'Plumber Pete', 'Mechanic Mike',
  'Farmer Fred', 'Rancher Rick', 'Cowboy Cody', 'Sheriff Sam', 'Deputy Dan',
  // Additional work/occupation themed names
  'Miner Max', 'Welder Walt', 'Driver Dave', 'Pilot Pete', 'Sailor Sam',
  'Chef Charlie', 'Doctor Doug', 'Nurse Nancy', 'Teacher Tim', 'Lawyer Larry',
  'Artist Andy', 'Writer Will', 'Musician Mike', 'Actor Adam', 'Director Dan',
  
  // Mythical/legendary themed
  'Atlas', 'Hercules', 'Samson', 'Goliath', 'Titan', 'Giant', 'Colossus', 'Behemoth',
  'Leviathan', 'Kraken', 'Juggernaut', 'Gargantua', 'Cyclops', 'Minotaur', 'Centaur',
  // Additional mythical/legendary themed names
  'Odin', 'Thor', 'Loki', 'Zeus', 'Poseidon', 'Hades', 'Ares', 'Apollo',
  'Athena', 'Artemis', 'Demeter', 'Dionysus', 'Hermes', 'Persephone', 'Hephaestus',
  'Baldur', 'Freyr', 'Heimdall', 'Tyr', 'Vidar', 'Vali', 'Ullr', 'Forseti',
  
  // Nature themed
  'Mountain Mover', 'River Runner', 'Forest Hauler', 'Desert Dragger', 'Ocean Tugger',
  'Glacier Grinder', 'Volcano Vaulter', 'Canyon Crusher', 'Valley Voyager', 'Prairie Puller',
  // Additional nature themed names
  'Meadow Musher', 'Swamp Slider', 'Tundra Tugger', 'Jungle Juggler', 'Savanna Sprinter',
  'Arctic Anchor', 'Tropical Tug', 'Alpine Anchor', 'Coastal Crusher', 'Marsh Mover',
  'Steppe Strider', 'Plateau Puller', 'Basin Brawler', 'Delta Dragger', 'Estuary Express',
  
  // Space themed
  'Cosmic Hauler', 'Galaxy Glider', 'Stellar Strider', 'Nebula Navigator', 'Comet Chaser',
  'Meteor Mover', 'Asteroid Anchor', 'Planet Puller', 'Star Strider', 'Orbit Operator',
  // Additional space themed names
  'Galactic Glider', 'Universal Usher', 'Celestial Carrier', 'Lunar Lifter', 'Solar Sailer',
  'Stellar Steerer', 'Nebular Navigator', 'Cometary Commander', 'Asteroidal Anchor', 'Planetary Puller',
  'Starry Strider', 'Orbital Operator', 'Cosmos Carrier', 'Milky Way Mover', 'Black Hole Hauler'
]

// Horse names (keeping the expanded list I added previously)
// DOUBLED with additional realistic and creative names
const horseNames = [
  'Thunder Bay', 'Midnight Express', 'Desert Storm', 'Got Immunity', 'Rocket Man',
  'Silver Bullet', 'Golden Arrow', 'Blue Thunder', 'Red Lightning', 'Green Machine',
  'Purple Haze', 'Orange Crush', 'Yellow Submarine', 'Black Pearl', 'White Knight',
  'Pink Panther', 'Brown Bear', 'Grey Wolf', 'Turquoise Twist', 'Magenta Magic',
  'Crimson Tide', 'Azure Sky', 'Emerald City', 'Ruby Red', 'Sapphire Blue',
  'Amber Waves', 'Jade Empire', 'Onyx Black', 'Pearl Harbor', 'Diamond Dust',
  'Platinum Blonde', 'Bronze Medal', 'Copper Penny', 'Steel Magnolia', 'Iron Man',
  // Additional horse names to reduce repetition
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
  // Additional creative horse names
  'Lightning Strike', 'Storm Chaser', 'Wind Walker', 'Fire Flash', 'Ice Breaker',
  'Earth Shaker', 'Ocean Surfer', 'Mountain Climber', 'Desert Rose', 'Forest Spirit',
  'Sky Dancer', 'Sun Beam', 'Moon Glow', 'Star Light', 'Comet Tail',
  'Thunder Clap', 'Rain Drop', 'Snow Flake', 'Flame Thrower', 'Wave Rider',
  'Stone Crusher', 'Sand Castle', 'Mist Maker', 'Fog Buster', 'Cloud Drifter',
  'Dawn Breaker', 'Twilight Sparkle', 'Midnight Shadow', 'Noon Sun', 'Evening Star',
  'Spring Breeze', 'Summer Heat', 'Autumn Leaf', 'Winter Chill', 'Seasons Change',
  'Fast Lane', 'Quick Step', 'Swift Move', 'Rapid Fire', 'Speed Demon'
]

// Greyhound trainer names
const trainerNames = [
  'T: John Smith', 'T: Robert Wilson', 'T: David Thompson', 'T: Michael Chen',
  'T: Emma Wilson', 'T: James Parker', 'T: Lisa Anderson', 'T: William Wright',
  'T: Amanda Clark', 'T: Thomas Brown', 'T: Margaret Davis', 'T: Christopher Wilson',
  'T: Patricia Miller', 'T: Daniel Taylor', 'T: Linda Martinez', 'T: Matthew Anderson',
  'T: Barbara Thomas', 'T: Anthony Garcia', 'T: Susan Rodriguez', 'T: Mark Wilson',
  'T: Betty Lopez', 'T: Paul Martinez', 'T: Dorothy Hernandez', 'T: Steven Gonzalez',
  'T: Helen Perez', 'T: Andrew Taylor', 'T: Carol Jackson', 'T: Kenneth Moore',
  'T: Ruth Martin', 'T: Joshua Lee', 'T: Sharon Thompson', 'T: Kevin White',
  'T: Catherine Harris', 'T: Sarah Johnson', 'T: Jennifer Lee', 'T: Olivia Smith'
]

// Harness racing driver names
const driverNames = [
  'D: Michael Chen', 'D: Emma Wilson', 'D: David Thompson', 'D: James Parker',
  'D: Lisa Anderson', 'D: William Wright', 'D: Amanda Clark', 'D: Thomas Brown',
  'D: Margaret Davis', 'D: Christopher Wilson', 'D: Patricia Miller', 'D: Daniel Taylor',
  'D: Linda Martinez', 'D: Matthew Anderson', 'D: Barbara Thomas', 'D: Anthony Garcia',
  'D: Susan Rodriguez', 'D: Mark Wilson', 'D: Betty Lopez', 'D: Paul Martinez',
  'D: Dorothy Hernandez', 'D: Steven Gonzalez', 'D: Helen Perez', 'D: Andrew Taylor',
  'D: Carol Jackson', 'D: Kenneth Moore', 'D: Ruth Martin', 'D: Joshua Lee',
  'D: Sharon Thompson', 'D: Kevin White', 'D: Catherine Harris', 'D: Sarah Johnson',
  'D: Jennifer Lee', 'D: Robert King', 'D: Olivia Smith', 'D: R Vaibhav'
]

// Silk colors for visual distinction
const silkColors = [
  'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
  'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500',
  'bg-lime-500', 'bg-emerald-500', 'bg-violet-500', 'bg-fuchsia-500', 'bg-rose-500',
  'bg-sky-500', 'bg-amber-500', 'bg-slate-500', 'bg-gray-500', 'bg-zinc-500'
]

// Best times for horses (RESTORED - these were deleted in commit f0335b40f2f58000cde43823a66d1c16105584cd)
// DOUBLED with realistic times
const bestTimes = [
  '56.2s', '57.8s', '58.1s', '59.3s', '1:01.2', '1:02.7', '1:03.4', '1:04.1',
  '1:05.6', '1:06.3', '1:07.8', '1:08.2', '1:09.7', '1:10.4', '1:11.9',
  '1:12.6', '1:13.1', '1:14.8', '1:15.3', '1:16.7', '1:17.2', '1:18.9',
  '1:19.4', '1:20.1', '1:21.6', '1:22.3', '1:23.8', '1:24.5', '1:25.2',
  '1:26.7', '1:27.4', '1:28.9', '1:29.6', '1:30.3', '1:31.8', '1:32.5',
  // Additional realistic horse times
  '55.8s', '57.3s', '58.6s', '59.1s', '1:00.8', '1:02.3', '1:03.9', '1:04.7',
  '1:05.2', '1:06.8', '1:07.4', '1:08.9', '1:09.3', '1:10.8', '1:11.4',
  '1:12.9', '1:13.6', '1:14.2', '1:15.8', '1:16.3', '1:17.9', '1:18.4',
  '1:19.9', '1:20.6', '1:21.2', '1:22.8', '1:23.4', '1:24.9', '1:25.7',
  '1:26.3', '1:27.9', '1:28.4', '1:29.2', '1:30.8', '1:31.4', '1:32.9'
]

// Get name pools based on category ID
const getNamePool = (categoryId: string) => {
  // Category IDs from test-category-ids.js
  const CATEGORY_IDS = {
    HORSE: '4a2788f8-e825-4d36-9894-efd4baf1cfae',
    GREYHOUND: '9daef0d7-bf3c-4f50-921d-8e818c60fe61',
    HARNESS: '161d9be2-e909-4326-8c2c-35ed71fb460b'
  }
  
  switch (categoryId) {
    case CATEGORY_IDS.GREYHOUND: // Greyhound
      return {
        names: [...greyhoundNames].sort(() => Math.random() - 0.5),
        jockeys: [...trainerNames].sort(() => Math.random() - 0.5)
      }
    case CATEGORY_IDS.HARNESS: // Harness
      return {
        names: [...harnessNames].sort(() => Math.random() - 0.5),
        jockeys: [...harnessDriverNames].sort(() => Math.random() - 0.5) // Use the restored harnessDriverNames
      }
    default: // Horse racing (default)
      return {
        names: [...horseNames].sort(() => Math.random() - 0.5),
        jockeys: [...horseJockeyNames].sort(() => Math.random() - 0.5)
      }
  }
}

// Generate randomized runners for a race
export function generateRandomizedRunners(raceId: string, categoryId: string): SimulatedRunner[] {
  const runners: SimulatedRunner[] = []
  const numRunners = 8 + Math.floor(Math.random() * 4) // 8-11 runners
  
  // Get category-specific name pools
  const { names: shuffledNames, jockeys: shuffledJockeys } = getNamePool(categoryId)
  const shuffledSilkColors = [...silkColors].sort(() => Math.random() - 0.5)
  const shuffledTimes = [...bestTimes].sort(() => Math.random() - 0.5)
  
  // Get category-specific weights
  const shuffledWeights = categoryId === '4a2788f8-e825-4d36-9894-efd4baf1cfae' 
    ? [...horseWeights].sort(() => Math.random() - 0.5) 
    : []
  
  // Get category-specific best times
  const shuffledGreyhoundTimes = categoryId === '9daef0d7-bf3c-4f50-921d-8e818c60fe61' 
    ? [...greyhoundBestTimes].sort(() => Math.random() - 0.5) 
    : []
  
  for (let i = 0; i < numRunners; i++) {
    const name = shuffledNames[i % shuffledNames.length]
    const jockey = shuffledJockeys[i % shuffledJockeys.length]
    const weight = categoryId === '4a2788f8-e825-4d36-9894-efd4baf1cfae' 
      ? shuffledWeights[i % shuffledWeights.length] 
      : `${50 + Math.floor(Math.random() * 15)}kg` // 50-64kg for non-horse categories
    const bestTime = categoryId === '9daef0d7-bf3c-4f50-921d-8e818c60fe61' 
      ? shuffledGreyhoundTimes[i % shuffledGreyhoundTimes.length] 
      : shuffledTimes[i % shuffledTimes.length]
    
    // Generate base odds with favorites having shorter odds
    let baseOdds: number
    if (i < 2) {
      // Positions 1-2: 1.5-2.5 (favorites)
      baseOdds = 1.5 + (Math.random() * 1.0);
    } else if (i < 5) {
      // Positions 3-5: 2.5-5.0 (contenders)
      baseOdds = 2.5 + (Math.random() * 2.5);
    } else {
      // Positions 6+: 5.0-20.0 (outsiders)
      baseOdds = 5.0 + (Math.random() * 15.0);
    }
    
    // Add some category-specific adjustments
    if (categoryId === '9daef0d7-bf3c-4f50-921d-8e818c60fe61') { // Greyhound
      // Greyhounds typically have shorter odds
      baseOdds *= 0.8;
    } else if (categoryId === '161d9be2-e909-4326-8c2c-35ed71fb460b') { // Harness
      // Harness typically has longer odds
      baseOdds *= 1.2;
    }
    
    // Ensure minimum odds of 1.10
    const odds = Math.max(1.10, baseOdds);
    
    runners.push({
      id: `runner-${raceId}-${i + 1}`,
      number: i + 1,
      name,
      weight,
      jockey,
      odds: parseFloat(odds.toFixed(2)), // Round to 2 decimal places
      oddsTrend: 'none',
      silkColor: shuffledSilkColors[i % shuffledSilkColors.length],
      bestTime
    })
  }
  
  return runners
}

// Initialize odds simulation for a race
export function initializeOddsSimulation(raceId: string, runners: SimulatedRunner[]) {
  // Only initialize if not already initialized
  if (!simulations.value[raceId]) {
    simulations.value[raceId] = {
      runners: {},
      lastUpdate: 0
    }
    
    // Add runners to simulation
    for (const runner of runners) {
      simulations.value[raceId].runners[runner.id] = { ...runner }
    }
  }
  
  return simulations.value[raceId]
}

// Update odds for a race based on simulation progress
export function updateOdds(
  raceId: string,
  progressByRunner: Record<string, number>,
  order: string[]
) {
  const now = Date.now()
  const simulation = simulations.value[raceId]
  
  // If no simulation exists for this race, return
  if (!simulation) {
    return
  }
  
  // Throttle updates to 1200ms intervals to prevent excessive updates (increased from 200ms)
  // This is slightly less than the 3000ms update interval to avoid unnecessary blocking
  if (now - simulation.lastUpdate < 1200) {
    return
  }
  
  // Update last update time
  simulation.lastUpdate = now
  
  // Update odds for each runner
  for (const runnerId of Object.keys(progressByRunner)) {
    const runner = simulation.runners[runnerId]
    if (!runner) continue
    
    const progress = progressByRunner[runnerId]
    const currentPosition = order.indexOf(runnerId) + 1
    const totalRunners = order.length
    
    // Calculate new odds based on position and progress
    // Leaders get shorter odds, trailers get longer odds
    const positionFactor = currentPosition / totalRunners
    
    // Progress factor (0-1, where 1 is finished)
    const progressFactor = progress
    
    // Base odds calculation
    let newOdds = typeof runner.odds === 'number' ? runner.odds : 2.0 // Default to 2.0 if SP
    
    // Adjust odds based on position and progress with moderate changes for realism
    // If runner is leading and making good progress, shorten odds
    if (positionFactor < 0.3 && progressFactor > 0.5) {
      newOdds = Math.max(1.1, newOdds * 0.97) // Moderate shortening for leaders
    }
    // If runner is trailing and not making good progress, lengthen odds
    else if (positionFactor > 0.7 && progressFactor < 0.3) {
      newOdds = newOdds * 1.03 // Moderate lengthening for trailers
    }
    // Otherwise make small random adjustments
    else {
      const randomFactor = 0.98 + (Math.random() * 0.04) // 0.98-1.02 for small changes
      newOdds = newOdds * randomFactor
    }
    
    // Ensure reasonable odds range
    newOdds = Math.min(100, Math.max(1.1, newOdds))
    
    // Determine odds trend
    let trend: OddsTrend = 'none'
    const originalOdds = typeof runner.odds === 'number' ? runner.odds : 2.0 // Default to 2.0 if SP
    const change = Math.abs(newOdds - originalOdds)
    
    // Only show trend if change is significant (> 0.02)
    if (change > 0.02) {
      trend = newOdds < originalOdds ? 'up' : 'down'
    }
    
    // Update runner with new odds
    const displayOdds = parseFloat(newOdds.toFixed(2))
    simulation.runners[runnerId] = {
      ...runner,
      odds: displayOdds,
      oddsTrend: trend
    }
  }
  
  // No need to trigger reactive update here as Vue will react to individual property changes
  // The individual runner updates above will trigger reactivity automatically
}

// Get simulated runners for a race
export function getSimulatedRunners(raceId: string): SimulatedRunner[] {
  const simulation = simulations.value[raceId]
  if (!simulation) {
    return []
  }
  
  return Object.values(simulation.runners)
}

// Reset simulation for a race
export function resetSimulation(raceId: string) {
  if (simulations.value[raceId]) {
    delete simulations.value[raceId]
  }
}