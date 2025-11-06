/**
 * Odds trend indicators
 */
export type OddsTrend = 'up' | 'down' | 'none'

/**
 * Simulated runner information
 */
export interface SimulatedRunner {
  id: string
  number: number
  name: string
  weight: string
  jockey: string
  odds: number | 'SP'
  oddsTrend: OddsTrend
  silkColor: string
  bestTime?: string
}

/**
 * Simulation state
 */
export interface SimulationState {
  id: string
  isRunning: boolean
  isFinished: boolean
  progress?: {
    progressByRunner: Record<string, number>
    order: string[]
    gaps: Record<string, number>
    etaMs: number
  }
}