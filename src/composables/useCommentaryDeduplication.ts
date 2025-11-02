import { useSimulationStore } from '../stores/simulation'

// Local type definitions (mirroring simulation store types)
type GapCategory = 'neck-and-neck' | 'narrow' | 'clear' | 'none'
type RacePhase = 'early' | 'mid' | 'late'
type CommentaryType = 'leader' | 'gap' | 'phase' | 'generic'

// Timing constants
const COMMENTARY_THROTTLE_SAME_TYPE = 5000 // 5 seconds
const COMMENTARY_THROTTLE_DIFF_LEADER = 3000 // 3 seconds

interface CommentaryContext {
  raceId: string
  meetingName: string
  raceNumber: number
  categoryId: string
  leaderId: string | null
  secondId: string | null
  gap: number
  raceProgress: number
  runnerData: Array<{ id: string; name: string; odds?: number }>
}

/**
 * Determines the gap category based on gap value
 */
function determineGapCategory(gap: number): GapCategory {
  if (gap < 0.1) return 'neck-and-neck'
  if (gap < 0.3) return 'narrow'
  if (gap > 0) return 'clear'
  return 'none'
}

/**
 * Determines the race phase based on progress (0-1)
 */
function determineRacePhase(progress: number): RacePhase {
  if (progress < 0.3) return 'early'
  if (progress < 0.7) return 'mid'
  return 'late'
}

/**
 * Checks if commentary should be generated based on throttling rules
 */
function shouldGenerateCommentary(
  raceId: string,
  currentType: CommentaryType,
  leaderChanged: boolean,
  gapCategoryChanged: boolean,
  phaseChanged: boolean
): boolean {
  const simulationStore = useSimulationStore()
  const state = simulationStore.getCommentaryState(raceId)
  
  if (!state) return true
  
  const now = Date.now()
  const timeSinceLastCommentary = now - state.lastCommentaryTimestamp
  
  // Immediate commentary for leader changes or phase transitions
  if (leaderChanged || phaseChanged) return true
  
  // Immediate commentary for gap category changes
  if (gapCategoryChanged) return true
  
  // Throttle same type commentary
  if (currentType === state.lastCommentaryType) {
    return timeSinceLastCommentary >= COMMENTARY_THROTTLE_SAME_TYPE
  }
  
  // Throttle different leader in same gap category
  return timeSinceLastCommentary >= COMMENTARY_THROTTLE_DIFF_LEADER
}

/**
 * Generates commentary with race identification wrapper
 */
function formatCommentary(meetingName: string, raceNumber: number, message: string): string {
  return `${meetingName} R${raceNumber}: ${message}`
}

/**
 * Selects commentary from pool, avoiding recent repetitions
 */
function selectCommentaryFromPool(raceId: string, pool: string[]): string {
  const simulationStore = useSimulationStore()
  const state = simulationStore.getCommentaryState(raceId)
  
  if (!state || state.commentaryHistory.length === 0) {
    return pool[Math.floor(Math.random() * pool.length)]
  }
  
  // Get recent messages
  const recentMessages = state.commentaryHistory.map((h: { message: string }) => h.message)
  
  // Filter out recently used commentary
  const availablePool = pool.filter(msg => !recentMessages.includes(msg))
  
  // If all are used, use full pool
  if (availablePool.length === 0) {
    return pool[Math.floor(Math.random() * pool.length)]
  }
  
  return availablePool[Math.floor(Math.random() * availablePool.length)]
}

/**
 * Generates category-specific commentary based on context
 */
function generateCategoryCommentary(context: CommentaryContext, gapCategory: GapCategory, phase: RacePhase): string {
  const { categoryId, leaderId, secondId, runnerData } = context
  
  const leader = runnerData.find(r => r.id === leaderId)
  const second = runnerData.find(r => r.id === secondId)
  
  if (!leader) return 'The race is underway!'
  
  const leaderName = leader.name
  const secondName = second?.name || 'the field'
  
  let pool: string[] = []
  
  // Build commentary pool based on gap category and phase
  if (gapCategory === 'neck-and-neck' && second) {
    pool = [
      `${leaderName} and ${secondName} are neck and neck!`,
      `${leaderName} and ${secondName} are locked in a fierce battle!`,
      `${leaderName} and ${secondName} are inseparable at the lead!`,
      `A thrilling duel between ${leaderName} and ${secondName}!`,
      `${leaderName} and ${secondName} are matching each other stride for stride!`
    ]
  } else if (gapCategory === 'narrow' && second) {
    pool = [
      `${leaderName} holds a narrow lead over ${secondName}`,
      `${leaderName} edges ahead of ${secondName}`,
      `${leaderName} maintains a slender advantage over ${secondName}`,
      `${leaderName} just holds the advantage over ${secondName}`
    ]
  } else if (gapCategory === 'clear' && second) {
    pool = [
      `${leaderName} has opened up a clear lead over ${secondName}`,
      `${leaderName} is pulling away from ${secondName}`,
      `${leaderName} has broken clear at the head of the field`,
      `${leaderName} is striding away from the competition`
    ]
  } else {
    // Solo leader or generic commentary
    if (phase === 'early') {
      pool = [
        `${leaderName} sets the early pace`,
        `${leaderName} takes an early lead`,
        `${leaderName} is showing the way early`,
        `Early leader ${leaderName} is dictating the tempo`
      ]
    } else if (phase === 'mid') {
      pool = [
        `${leaderName} is leading at the halfway mark`,
        `${leaderName} holds the lead mid-race`,
        `${leaderName} maintains the advantage`,
        `${leaderName} continues to lead`
      ]
    } else {
      pool = [
        `${leaderName} has a commanding lead in the final stages`,
        `${leaderName} is pulling away in the closing stages`,
        `${leaderName} has broken clear in the final stages`,
        `${leaderName} is striding to victory`
      ]
    }
  }
  
  // Add category-specific flavor
  if (categoryId === '9daef0d7-bf3c-4f50-921d-8e818c60fe61') {
    // Greyhound - add speed references
    const speedyPool = pool.map(msg => msg.replace(/lead/, 'lead at blistering pace').replace(/ahead/, 'ahead with speed'))
    pool = [...pool, ...speedyPool.slice(0, 2)]
  }
  
  return selectCommentaryFromPool(context.raceId, pool)
}

/**
 * Main composable for commentary deduplication
 */
export function useCommentaryDeduplication() {
  const simulationStore = useSimulationStore()
  
  /**
   * Generates commentary if conditions are met
   * Returns null if commentary should be suppressed
   */
  const generateCommentary = (context: CommentaryContext): string | null => {
    const { raceId, meetingName, raceNumber, leaderId, secondId, gap, raceProgress } = context
    
    const state = simulationStore.getCommentaryState(raceId)
    if (!state) return null
    
    // Determine current state
    const currentGapCategory = determineGapCategory(gap)
    const currentPhase = determineRacePhase(raceProgress)
    
    // Check for state changes
    const leaderChanged = leaderId !== state.currentLeaderId
    const gapCategoryChanged = currentGapCategory !== state.lastGapCategory
    const phaseChanged = currentPhase !== state.racePhase
    
    // Determine commentary type
    let commentaryType: CommentaryType = 'generic'
    if (leaderChanged) commentaryType = 'leader'
    else if (gapCategoryChanged) commentaryType = 'gap'
    else if (phaseChanged) commentaryType = 'phase'
    
    // Check if we should generate commentary
    if (!shouldGenerateCommentary(raceId, commentaryType, leaderChanged, gapCategoryChanged, phaseChanged)) {
      return null
    }
    
    // Generate commentary message
    const message = generateCategoryCommentary(context, currentGapCategory, currentPhase)
    const formattedMessage = formatCommentary(meetingName, raceNumber, message)
    
    // Update commentary state
    simulationStore.updateCommentaryState(raceId, {
      currentLeaderId: leaderId,
      currentSecondId: secondId,
      lastGapCategory: currentGapCategory,
      racePhase: currentPhase
    })
    
    // Add to history
    simulationStore.addCommentaryToHistory(raceId, message, commentaryType)
    
    return formattedMessage
  }
  
  /**
   * Generates start commentary
   */
  const generateStartCommentary = (meetingName: string, raceNumber: number): string => {
    const messages = [
      `And they're off!`,
      `The race is underway!`,
      `The field bursts into action!`,
      `And the race begins!`
    ]
    const message = messages[Math.floor(Math.random() * messages.length)]
    return formatCommentary(meetingName, raceNumber, message)
  }
  
  /**
   * Generates finish commentary
   */
  const generateFinishCommentary = (meetingName: string, raceNumber: number, winnerName: string): string => {
    const messages = [
      `${winnerName} wins!`,
      `${winnerName} takes victory!`,
      `${winnerName} crosses the line first!`,
      `Victory to ${winnerName}!`
    ]
    const message = messages[Math.floor(Math.random() * messages.length)]
    return formatCommentary(meetingName, raceNumber, message)
  }
  
  return {
    generateCommentary,
    generateStartCommentary,
    generateFinishCommentary
  }
}
