import { ref } from 'vue'
import { useCategoryCommentary } from './useCategoryCommentary'
import { useLeaderCommentary } from './useLeaderCommentary'
import { useOvertakeCommentary } from './useOvertakeCommentary'
import { useStartFinishCommentary } from './useStartFinishCommentary'
import { useRaceProgressCommentary } from './useRaceProgressCommentary'
import { useWinnerCommentary } from './useWinnerCommentary'
import { getSimulatedRunners } from './useOddsSimulation'

// Define types
interface RaceCommentary {
  message: string
  timestamp: number
  type: 'leader' | 'overtake' | 'start' | 'finish' | 'generic'
}

interface UseRaceCommentaryReturn {
  commentary: { value: RaceCommentary[] }
  addCommentary: (message: string, type: RaceCommentary['type']) => void
  generateLeaderUpdate: (raceId: string, progress: any) => void
  generateOvertakeCommentary: (raceId: string, progress: any) => void
  generateStartCommentary: (meetingName: string, raceNumber: number) => void
  generateFinishCommentary: (meetingName: string, raceNumber: number, winner: string) => void
  generateRaceCommentary: (raceId: string, progress: any, meetingName: string, raceNumber: number, categoryId: string) => string
  generateWinnerAnnouncement: (raceId: string, winnerId: string, meetingName: string, raceNumber: number) => string
  clearCommentary: () => void
}

// Store commentary history per race to avoid repetition
const raceCommentaryHistory: Record<string, string[]> = {}

// Category-specific commentary with odds influence
const getCategoryCommentary = (categoryId: string, runners: any[] = []): string => {
  // Find the favorite (shortest odds) and outsider (longest odds) if runners are provided
  let favorite: any = null;
  let outsider: any = null;
  
  if (runners.length > 0) {
    const runnersWithOdds = runners.filter(r => typeof r.odds === 'number');
    if (runnersWithOdds.length > 0) {
      favorite = runnersWithOdds.reduce((min, r) => r.odds < min.odds ? r : min, runnersWithOdds[0]);
      outsider = runnersWithOdds.reduce((max, r) => r.odds > max.odds ? r : max, runnersWithOdds[0]);
    }
  }
  
  switch (categoryId) {
    case '4a2788f8-e825-4d36-9894-efd4baf1cfae': // Horse
      const horseCommentary = [
        "The field is bunched up early with plenty of tactical speed!",
        "The pace looks comfortable but could intensify in the final stages.",
        "The jockeys are positioning their mounts carefully for the final turn.",
        "Plenty of horsepower on display with multiple contenders in the mix.",
        "The riders are jostling for position in a highly competitive field.",
        "The horses are settling into a steady rhythm with favorites tracking well.",
        "The field is moving together in a tight group with no clear leader yet.",
        "Early stages unfolding evenly with all runners in contention.",
        "The competitors are feeling each other out for the decisive move.",
        "The pace is steady but not taxing with a strong finish expected.",
        "The early running is proving deceptively slow with potential for fireworks.",
        "Several pace setters are engaged in a tactical battle up front.",
        "The field dynamics are shifting with new contenders emerging.",
        "Midfield runners are staying in touch with the early leaders.",
        "The tempo is building with favorites beginning to assert themselves."
      ];
      
      // Add odds-specific commentary if we have runner data
      if (favorite && outsider) {
        horseCommentary.push(
          `Market leader ${favorite.name} (${favorite.odds.toFixed(2)}) is being rated perfectly in midfield.`,
          `Each-way chance ${outsider.name} (${outsider.odds.toFixed(2)}) is traveling strongly in the field.`,
          `Hot favorite ${favorite.name} (${favorite.odds.toFixed(2)}) is tracking the pace beautifully.`,
          `Outside chance ${outsider.name} (${outsider.odds.toFixed(2)}) is getting a lovely run in the field.`,
          `The ${favorite.odds.toFixed(2)} favorite is holding a perfect position three wide.`,
          `${outsider.name} (${outsider.odds.toFixed(2)}) is making smooth progress through the field.`
        );
      }
      
      return horseCommentary[Math.floor(Math.random() * horseCommentary.length)];
    case '9daef0d7-bf3c-4f50-921d-8e818c60fe61': // Greyhound
      const greyhoundCommentary = [
        "They're off and running at full speed with the field bunched early!",
        "The dogs are flying down the track with early leaders setting a frantic pace!",
        "What a lightning start from the field with multiple dogs in contention!",
        "The greyhounds are hitting their stride with the pace heating up quickly!",
        "Top speed already being reached with favorites tracking the early leaders!",
        "The hounds are stretching out in the early stages with clear leaders emerging!",
        "The field is bunched but moving at a cracking pace down the back straight!",
        "The dogs are hitting the first turn at full tilt with no give in the pace!",
        "Early leaders are setting a blistering pace with favorites closing in!",
        "The greyhounds are showing their speed early with a fierce battle for the lead!",
        "The tempo is red-hot with several dogs locked in a speed duel!",
        "Multiple greyhounds are running stride for stride in a thrilling contest!",
        "The early pace is taking its toll with some runners beginning to falter!",
        "Favorites are moving up quickly with a strong challenge developing!",
        "The field dynamics are shifting with new threats emerging down the back stretch!"
      ];
      
      // Add odds-specific commentary if we have runner data
      if (favorite && outsider) {
        greyhoundCommentary.push(
          `Clear favorite ${favorite.name} (${favorite.odds.toFixed(2)}) is leading the chase with authority!`,
          `Outside chance ${outsider.name} (${outsider.odds.toFixed(2)}) is flying wide and running boldly!`,
          `Market mover ${favorite.name} (${favorite.odds.toFixed(2)}) is dictating the early pace perfectly!`,
          `${outsider.name} (${outsider.odds.toFixed(2)}) is making all the running and looking dangerous!`,
          `The ${favorite.odds.toFixed(2)} favorite is holding a commanding lead down the back straight!`,
          `Each-way play ${outsider.name} (${outsider.odds.toFixed(2)}) is closing strongly on the leaders!`
        );
      }
      
      return greyhoundCommentary[Math.floor(Math.random() * greyhoundCommentary.length)];
    case '161d9be2-e909-4326-8c2c-35ed71fb460b': // Harness
      const harnessCommentary = [
        "The pacemaker is setting a steady tempo with the field tracking three wide!",
        "The drivers are working their horses hard with favorites moving to the front!",
        "The sulky wheels are spinning fast with a clear leader emerging!",
        "The field is moving in unison with several contenders in the mix!",
        "The trotters are maintaining a good rhythm with favorites holding position!",
        "The paceline is holding together well with tactical moves developing!",
        "The drivers are jostling for the best position in a competitive field!",
        "The trotters are hitting their stride now with the pace building!",
        "The field is moving at a consistent pace with favorites beginning to assert!",
        "The horses are settling into their rhythm with a strong finish expected!",
        "The tempo is picking up with favorites making their move down the back stretch!",
        "Several trotters are engaged in a tactical battle for the lead!",
        "The field dynamics are shifting with new contenders emerging in the lane!",
        "Midfield runners are staying in touch with the early leaders perfectly!",
        "The pace is building with favorites beginning to assert their superiority!"
      ];
      
      // Add odds-specific commentary if we have runner data
      if (favorite && outsider) {
        harnessCommentary.push(
          `Touted choice ${favorite.name} (${favorite.odds.toFixed(2)}) is tracking the pace perfectly in the pocket.`,
          `Each-way chance ${outsider.name} (${outsider.odds.toFixed(2)}) is getting a lovely run in the field.`,
          `Short money ${favorite.name} (${favorite.odds.toFixed(2)}) is holding a comfortable position on the rail.`,
          `${outsider.name} (${outsider.odds.toFixed(2)}) is making smooth progress through the field.`,
          `The ${favorite.odds.toFixed(2)} favorite is rating his effort perfectly in midfield.`,
          `Outside chance ${outsider.name} (${outsider.odds.toFixed(2)}) is closing strongly on the leaders.`
        );
      }
      
      return harnessCommentary[Math.floor(Math.random() * harnessCommentary.length)];
    default:
      const genericCommentary = [
        "The race is underway with a highly competitive field!",
        "The competitors are off to a strong start with multiple contenders!",
        "The field is moving forward steadily with favorites tracking well!",
        "The pace is moderate but competitive with all runners in contention!",
        "The early stages are developing well with tactical moves afoot!",
        "The competitors are settling into position with favorites holding serve!",
        "The race is unfolding as expected with a strong field on display!",
        "The field is maintaining a good tempo with several threats emerging!",
        "The competitors are showing their form with a fierce battle developing!",
        "The early running is proving competitive with no clear advantage yet!",
        "The tempo is building with favorites beginning to assert themselves!",
        "Multiple runners are engaged in a tactical battle for the lead!",
        "The field dynamics are shifting with new contenders emerging!",
        "Midfield runners are staying in touch with the early leaders!",
        "The pace is picking up with a strong finish expected!"
      ];
      
      // Add odds-specific commentary if we have runner data
      if (favorite && outsider) {
        genericCommentary.push(
          `Favoritism for ${favorite.name} (${favorite.odds.toFixed(2)}) is showing early with a perfect position.`,
          `Value play ${outsider.name} (${outsider.odds.toFixed(2)}) is traveling well and staying in touch.`,
          `The market leader ${favorite.name} (${favorite.odds.toFixed(2)}) is in a perfect spot just off the pace.`,
          `${outsider.name} (${outsider.odds.toFixed(2)}) is tracking the leaders nicely and ready to pounce.`,
          `Hot favorite ${favorite.name} (${favorite.odds.toFixed(2)}) is holding position perfectly in midfield.`,
          `Each-way chance ${outsider.name} (${outsider.odds.toFixed(2)}) is making steady progress through the field.`
        );
      }
      
      return genericCommentary[Math.floor(Math.random() * genericCommentary.length)];
  }
}

/**
 * Composable for generating realistic race commentary
 */
export function useRaceCommentary(raceId: string): UseRaceCommentaryReturn {
  const commentary = ref<RaceCommentary[]>([])

  // Initialize commentary history for this race if not exists
  if (!raceCommentaryHistory[raceId]) {
    raceCommentaryHistory[raceId] = []
  }

  // Use the smaller composables
  const { getCategoryCommentary } = useCategoryCommentary()
  const { generateLeaderUpdate } = useLeaderCommentary()
  const { generateOvertakeCommentary } = useOvertakeCommentary()
  const { generateStartCommentary, generateFinishCommentary } = useStartFinishCommentary()
  const { generateRaceCommentary } = useRaceProgressCommentary()
  const { generateWinnerAnnouncement } = useWinnerCommentary()

  const addCommentary = (message: string, type: RaceCommentary['type']) => {
    // Avoid duplicate messages
    if (raceCommentaryHistory[raceId].includes(message)) {
      return
    }
    
    // Add to history
    raceCommentaryHistory[raceId].push(message)
    // Keep only last 10 messages to prevent memory issues
    if (raceCommentaryHistory[raceId].length > 10) {
      raceCommentaryHistory[raceId].shift()
    }
    
    // Add to commentary
    commentary.value.push({
      message,
      timestamp: Date.now(),
      type
    })
    
    // Keep only last 5 commentary items
    if (commentary.value.length > 5) {
      commentary.value.shift()
    }
  }

  const generateLeaderUpdateWrapper = (raceId: string, progress: any) => {
    // We need to import getSimulatedRunners to make this work
    // For now, we'll use a simplified approach
    if (!progress || !progress.order || progress.order.length === 0) return
    
    const message = generateLeaderUpdate(raceId, progress)
    if (message) {
      addCommentary(message, 'leader')
    }
  }

  const generateOvertakeCommentaryWrapper = (raceId: string, progress: any) => {
    // We need to import getSimulatedRunners to make this work
    // For now, we'll use a simplified approach
    if (!progress || !progress.order || progress.order.length < 2) return
    
    const message = generateOvertakeCommentary(raceId, progress)
    if (message) {
      addCommentary(message, 'overtake')
    }
  }

  const generateStartCommentaryWrapper = (meetingName: string, raceNumber: number) => {
    const message = generateStartCommentary(meetingName, raceNumber)
    addCommentary(message, 'start')
  }

  const generateFinishCommentaryWrapper = (meetingName: string, raceNumber: number, winner: string) => {
    const message = generateFinishCommentary(meetingName, raceNumber, winner)
    addCommentary(message, 'finish')
  }

  const clearCommentary = () => {
    commentary.value = []
    raceCommentaryHistory[raceId] = []
  }

  return {
    commentary,
    addCommentary,
    generateLeaderUpdate: generateLeaderUpdateWrapper,
    generateOvertakeCommentary: generateOvertakeCommentaryWrapper,
    generateStartCommentary: generateStartCommentaryWrapper,
    generateFinishCommentary: generateFinishCommentaryWrapper,
    generateRaceCommentary,
    generateWinnerAnnouncement,
    clearCommentary
  }
}