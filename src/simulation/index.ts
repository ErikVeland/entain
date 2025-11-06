// src/simulation/index.ts
// Entry point for simulation functionality
export type { SimulationConfig } from './types'

// Export simulation engine components
export { createRaceSimulation } from '../game/simulatedRace'
export type { 
  Tick, 
  Result, 
  RunnerInput, 
  RaceInput, 
  SimulationController 
} from '../game/simulatedRace'

// Export betting engine components
export { BettingEngine, DEFAULT_CONFIG } from '../game/bettingSimulator'
export type { 
  RaceQuote, 
  RunnerQuote, 
  BetLeg, 
  BetBase, 
  SingleBet, 
  MultiBet, 
  ExoticBet, 
  Bet, 
  SettlementRecord, 
  BettingConfig, 
  BankrollSnapshot 
} from '../game/bettingSimulator'