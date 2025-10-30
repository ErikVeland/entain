import { ref } from 'vue'
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

  const generateLeaderUpdate = (raceId: string, progress: any) => {
    if (!progress || !progress.order || progress.order.length === 0) return
    
    const runners = getSimulatedRunners(raceId)
    if (!runners || runners.length === 0) return
    
    const leaderId = progress.order[0]
    const leaderRunner = runners.find(r => r.id === leaderId)
    if (!leaderRunner) return
    
    // Generate varied commentary for leader updates
    const commentaryOptions = [
      `${leaderRunner.name} takes the lead!`,
      `${leaderRunner.name} moves to the front!`,
      `${leaderRunner.name} surges ahead!`,
      `${leaderRunner.name} powers into the lead!`,
      `${leaderRunner.name} seizes the lead!`,
      `${leaderRunner.name} makes a bold move to the front!`,
      `${leaderRunner.name} breaks clear at the front!`,
      `${leaderRunner.name} establishes a commanding lead!`,
      `${leaderRunner.name} bursts to the front of the field!`,
      `${leaderRunner.name} takes command of the race!`,
      `${leaderRunner.name} assumes the lead position!`,
      `${leaderRunner.name} charges to the front!`
    ]
    
    const randomCommentary = commentaryOptions[Math.floor(Math.random() * commentaryOptions.length)]
    addCommentary(randomCommentary, 'leader')
  }

  const generateOvertakeCommentary = (raceId: string, progress: any) => {
    if (!progress || !progress.order || progress.order.length < 2) return
    
    const runners = getSimulatedRunners(raceId)
    if (!runners || runners.length === 0) return
    
    // Check for significant position changes
    const leaderId = progress.order[0]
    const secondId = progress.order[1]
    
    const leaderRunner = runners.find(r => r.id === leaderId)
    const secondRunner = runners.find(r => r.id === secondId)
    
    if (!leaderRunner || !secondRunner) return
    
    // Generate overtaking commentary
    const commentaryOptions = [
      `${leaderRunner.name} pulls away from ${secondRunner.name}!`,
      `${leaderRunner.name} extends the lead over ${secondRunner.name}!`,
      `${leaderRunner.name} opens up a gap on ${secondRunner.name}!`,
      `${leaderRunner.name} builds a clear advantage over ${secondRunner.name}!`,
      `${secondRunner.name} tries to close the gap on ${leaderRunner.name}!`,
      `${secondRunner.name} gives chase to ${leaderRunner.name}!`,
      `${secondRunner.name} attempts to reel in ${leaderRunner.name}!`,
      `A clear battle for the lead between ${leaderRunner.name} and ${secondRunner.name}!`,
      `${leaderRunner.name} is widening the margin over ${secondRunner.name}!`,
      `${secondRunner.name} is pressing hard on ${leaderRunner.name}!`,
      `${leaderRunner.name} is holding off the challenge from ${secondRunner.name}!`,
      `${secondRunner.name} is making ground on the leader ${leaderRunner.name}!`
    ]
    
    const randomCommentary = commentaryOptions[Math.floor(Math.random() * commentaryOptions.length)]
    addCommentary(randomCommentary, 'overtake')
  }

  const generateStartCommentary = (meetingName: string, raceNumber: number) => {
    const commentaryOptions = [
      `${meetingName} R${raceNumber} is underway!`,
      `${meetingName} R${raceNumber} bursts into life!`,
      `${meetingName} R${raceNumber} gets off to a thrilling start!`,
      `And they're off at ${meetingName} for R${raceNumber}!`,
      `${meetingName} R${raceNumber} commences with great excitement!`,
      `The gates open for ${meetingName} R${raceNumber}!`,
      `${meetingName} R${raceNumber} is off and running!`,
      `The competitors spring from the gates at ${meetingName} R${raceNumber}!`,
      `${meetingName} R${raceNumber} explodes into action!`,
      `They're away at ${meetingName} for R${raceNumber}!`
    ]
    
    const randomCommentary = commentaryOptions[Math.floor(Math.random() * commentaryOptions.length)]
    addCommentary(randomCommentary, 'start')
  }

  const generateFinishCommentary = (meetingName: string, raceNumber: number, winner: string) => {
    const commentaryOptions = [
      `${winner} wins ${meetingName} R${raceNumber}!`,
      `${winner} takes victory in ${meetingName} R${raceNumber}!`,
      `${winner} claims victory at ${meetingName} R${raceNumber}!`,
      `${winner} crosses the line first in ${meetingName} R${raceNumber}!`,
      `${winner} secures a memorable win in ${meetingName} R${raceNumber}!`,
      `${meetingName} R${raceNumber} goes to ${winner}!`,
      `${winner} captures the prize in ${meetingName} R${raceNumber}!`,
      `${winner} prevails in ${meetingName} R${raceNumber}!`,
      `${winner} emerges victorious in ${meetingName} R${raceNumber}!`,
      `${winner} takes the spoils at ${meetingName} R${raceNumber}!`
    ]
    
    const randomCommentary = commentaryOptions[Math.floor(Math.random() * commentaryOptions.length)]
    addCommentary(randomCommentary, 'finish')
  }

  const generateRaceCommentary = (raceId: string, progress: any, meetingName: string, raceNumber: number, categoryId: string): string => {
    if (!progress || !progress.order || progress.order.length === 0) {
      // Return category-specific start commentary if no progress yet
      const runners = getSimulatedRunners(raceId);
      return `${meetingName} R${raceNumber} is underway! ${getCategoryCommentary(categoryId, runners)}`;
    }
    
    const runners = getSimulatedRunners(raceId);
    if (!runners || runners.length === 0) {
      return `${meetingName} R${raceNumber} is in progress`;
    }
    
    const leaderId = progress.order[0];
    const leaderRunner = runners.find(r => r.id === leaderId);
    
    if (!leaderRunner) {
      return `${meetingName} R${raceNumber} is in progress`;
    }
    
    // Check for close competition
    if (progress.order.length > 1 && progress.gaps) {
      const secondId = progress.order[1];
      const gap = Math.abs(progress.gaps[leaderId] - progress.gaps[secondId]);
      const secondRunner = runners.find(r => r.id === secondId);
      
      if (secondRunner) {
        if (gap < 0.1) {
          const neckAndNeckOptions = [
            `${leaderRunner.name} and ${secondRunner.name} are neck and neck!`,
            `${leaderRunner.name} and ${secondRunner.name} are running stride for stride!`,
            `${leaderRunner.name} and ${secondRunner.name} are locked in a fierce battle!`,
            `${leaderRunner.name} and ${secondRunner.name} are trading blows at the front!`,
            `${leaderRunner.name} and ${secondRunner.name} are inseparable at the lead!`,
            `${leaderRunner.name} and ${secondRunner.name} are matching each other move for move!`,
            `${leaderRunner.name} and ${secondRunner.name} are in a photo finish battle!`
          ];
          
          // Add odds-based commentary for close competition
          if (typeof leaderRunner.odds === 'number' && typeof secondRunner.odds === 'number') {
            if (leaderRunner.odds < secondRunner.odds) {
              neckAndNeckOptions.push(
                `${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) is holding off the challenge from ${secondRunner.name} (${secondRunner.odds.toFixed(2)})!`,
                `Market leader ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) is just ahead of ${secondRunner.name} (${secondRunner.odds.toFixed(2)})!`
              );
            } else {
              neckAndNeckOptions.push(
                `${secondRunner.name} (${secondRunner.odds.toFixed(2)}) is pressing hard on favorite ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)})!`,
                `Underdog ${secondRunner.name} (${secondRunner.odds.toFixed(2)}) is making ground on the leader ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)})!`
              );
            }
          }
          
          return neckAndNeckOptions[Math.floor(Math.random() * neckAndNeckOptions.length)];
        } else if (gap < 0.3) {
          const narrowLeadOptions = [
            `${leaderRunner.name} holds a narrow lead over ${secondRunner.name}`,
            `${leaderRunner.name} edges ahead of ${secondRunner.name}`,
            `${leaderRunner.name} maintains a slender advantage over ${secondRunner.name}`,
            `${leaderRunner.name} clings to a precarious lead over ${secondRunner.name}`,
            `${leaderRunner.name} just holds the advantage over ${secondRunner.name}`,
            `${leaderRunner.name} has a slight edge over ${secondRunner.name}`,
            `${leaderRunner.name} is barely ahead of ${secondRunner.name}`
          ];
          
          // Add odds-based commentary for narrow leads
          if (typeof leaderRunner.odds === 'number' && typeof secondRunner.odds === 'number') {
            if (leaderRunner.odds < secondRunner.odds) {
              narrowLeadOptions.push(
                `${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) is holding off ${secondRunner.name} (${secondRunner.odds.toFixed(2)})!`,
                `Favorite ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) clings to the lead over ${secondRunner.name} (${secondRunner.odds.toFixed(2)})!`
              );
            } else {
              narrowLeadOptions.push(
                `${secondRunner.name} (${secondRunner.odds.toFixed(2)}) is closing on ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)})!`,
                `Underdog ${secondRunner.name} (${secondRunner.odds.toFixed(2)}) is pressing the favorite ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)})!`
              );
            }
          }
          
          return narrowLeadOptions[Math.floor(Math.random() * narrowLeadOptions.length)];
        } else {
          const clearLeadOptions = [
            `${leaderRunner.name} has opened up a clear lead over ${secondRunner.name}`,
            `${leaderRunner.name} has established a commanding advantage over ${secondRunner.name}`,
            `${leaderRunner.name} is pulling away from ${secondRunner.name} at the front`,
            `${leaderRunner.name} has broken clear at the head of the field over ${secondRunner.name}`,
            `${leaderRunner.name} is striding away from the competition led by ${secondRunner.name}`,
            `${leaderRunner.name} has built a substantial lead over ${secondRunner.name}`,
            `${leaderRunner.name} is dominating the field with ${secondRunner.name} in pursuit`
          ];
          
          // Add odds-based commentary for clear leads
          if (typeof leaderRunner.odds === 'number' && typeof secondRunner.odds === 'number') {
            if (leaderRunner.odds < secondRunner.odds) {
              clearLeadOptions.push(
                `${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) has broken clear of ${secondRunner.name} (${secondRunner.odds.toFixed(2)})!`,
                `Market leader ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) is striding away from ${secondRunner.name} (${secondRunner.odds.toFixed(2)})!`
              );
            } else {
              clearLeadOptions.push(
                `Shock leader ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) has opened a gap on ${secondRunner.name} (${secondRunner.odds.toFixed(2)})!`,
                `Underdog ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) is pulling away from favorite ${secondRunner.name} (${secondRunner.odds.toFixed(2)})!`
              );
            }
          }
          
          return clearLeadOptions[Math.floor(Math.random() * clearLeadOptions.length)];
        }
      }
    }
    
    // Default leader commentary
    const leaderOptions = [
      `${leaderRunner.name} is leading ${meetingName} R${raceNumber}`,
      `${leaderRunner.name} holds the lead in ${meetingName} R${raceNumber}`,
      `${leaderRunner.name} maintains the advantage in ${meetingName} R${raceNumber}`,
      `${leaderRunner.name} continues to lead ${meetingName} R${raceNumber}`,
      `${leaderRunner.name} is setting the pace at the front of ${meetingName} R${raceNumber}`,
      `${leaderRunner.name} is showing the way at the head of the field in ${meetingName} R${raceNumber}`,
      `${leaderRunner.name} is dictating the tempo from the front in ${meetingName} R${raceNumber}`
    ];
    
    // Add odds-based commentary for solo leaders
    if (typeof leaderRunner.odds === 'number') {
      leaderOptions.push(
        `${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) is leading ${meetingName} R${raceNumber}`,
        `Market leader ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) holds the advantage in ${meetingName} R${raceNumber}`,
        `Favorite ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) continues to lead ${meetingName} R${raceNumber}`
      );
    }
    
    return leaderOptions[Math.floor(Math.random() * leaderOptions.length)];
  }

  const generateWinnerAnnouncement = (raceId: string, winnerId: string, meetingName: string, raceNumber: number): string => {
    const runners = getSimulatedRunners(raceId);
    if (!runners || runners.length === 0) {
      return `${meetingName} R${raceNumber}: Race finished`;
    }
    
    const winnerRunner = runners.find(r => r.id === winnerId);
    if (!winnerRunner) {
      return `${meetingName} R${raceNumber}: Race finished`;
    }
    
    const winnerOptions = [
      `${winnerRunner.name} wins ${meetingName} R${raceNumber}!`,
      `${winnerRunner.name} takes victory in ${meetingName} R${raceNumber}!`,
      `${winnerRunner.name} claims victory at ${meetingName} R${raceNumber}!`,
      `${winnerRunner.name} crosses the line first in ${meetingName} R${raceNumber}!`,
      `${winnerRunner.name} secures a memorable win in ${meetingName} R${raceNumber}!`,
      `${meetingName} R${raceNumber} goes to ${winnerRunner.name}!`,
      `${winnerRunner.name} captures the prize in ${meetingName} R${raceNumber}!`,
      `${winnerRunner.name} prevails in ${meetingName} R${raceNumber}!`
    ];
    
    // Add odds-based commentary for winners
    if (typeof winnerRunner.odds === 'number') {
      if (winnerRunner.odds < 3) {
        winnerOptions.push(
          `Hot favorite ${winnerRunner.name} (${winnerRunner.odds.toFixed(2)}) wins ${meetingName} R${raceNumber}!`,
          `Market leader ${winnerRunner.name} (${winnerRunner.odds.toFixed(2)}) takes victory in ${meetingName} R${raceNumber}!`
        );
      } else if (winnerRunner.odds > 10) {
        winnerOptions.push(
          `Giant killing ${winnerRunner.name} (${winnerRunner.odds.toFixed(2)}) wins ${meetingName} R${raceNumber}!`,
          `Shock result! Outsider ${winnerRunner.name} (${winnerRunner.odds.toFixed(2)}) prevails in ${meetingName} R${raceNumber}!`,
          `Each-way value! ${winnerRunner.name} (${winnerRunner.odds.toFixed(2)}) captures the prize in ${meetingName} R${raceNumber}!`
        );
      } else {
        winnerOptions.push(
          `${winnerRunner.name} (${winnerRunner.odds.toFixed(2)}) claims victory at ${meetingName} R${raceNumber}!`,
          `Solid win for ${winnerRunner.name} (${winnerRunner.odds.toFixed(2)}) in ${meetingName} R${raceNumber}!`
        );
      }
    }
    
    return winnerOptions[Math.floor(Math.random() * winnerOptions.length)];
  }

  const clearCommentary = () => {
    commentary.value = []
    raceCommentaryHistory[raceId] = []
  }

  return {
    commentary,
    addCommentary,
    generateLeaderUpdate,
    generateOvertakeCommentary,
    generateStartCommentary,
    generateFinishCommentary,
    generateRaceCommentary,
    generateWinnerAnnouncement,
    clearCommentary
  }
}