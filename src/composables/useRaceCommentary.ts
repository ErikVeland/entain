import { ref, Ref } from 'vue'
import { getSimulatedRunners } from './useOddsSimulation'

// Define commentary templates for different race scenarios
const commentaryTemplates = {
  // Leader change commentary
  leaderChange: [
    "{runner} takes the lead!",
    "{runner} moves into the lead!",
    "{runner} surges to the front!",
    "{runner} powers past the field to take the lead!",
    "{runner} makes a bold move to the front!",
    "{runner} breaks through to take command!",
    "{runner} seizes the lead with a strong push!",
    "{runner} storms to the front of the pack!",
    "{runner} finds another gear and moves ahead!",
    "{runner} takes control of the race!"
  ],
  
  // Close race commentary
  closeRace: [
    "What a tight race this is!",
    "The field is bunched up tightly!",
    "Any of these runners could win!",
    "It's anyone's race at this point!",
    "The runners are neck and neck!",
    "This is shaping up to be a photo finish!",
    "The gap between the leaders is closing!",
    "The chasing pack is closing in fast!",
    "What drama! The runners are all together!",
    "This is going down to the wire!"
  ],
  
  // Mid-race updates
  midRace: [
    "{runner} is holding a comfortable lead.",
    "{runner} continues to set the pace.",
    "{runner} is maintaining the lead nicely.",
    "{runner} looks strong out in front.",
    "{runner} is controlling the tempo.",
    "{runner} is setting a steady pace.",
    "{runner} is dictating the terms up front.",
    "{runner} is in command of this race.",
    "{runner} is showing the way.",
    "{runner} is leading the field."
  ],
  
  // Final stretch commentary
  finalStretch: [
    "They're heading for the final turn!",
    "Into the home straight!",
    "Here we go into the final furlong!",
    "The runners are hitting the final stretch!",
    "Down to the last few hundred meters!",
    "The final turn is approaching!",
    "They're rounding the final bend!",
    "Into the last straightaway!",
    "The home stretch awaits!",
    "The final push is coming up!"
  ],
  
  // Sprint finish commentary
  sprintFinish: [
    "{runner} kicks for home!",
    "{runner} finds another gear!",
    "{runner} makes a last-ditch effort!",
    "{runner} unleashes a final burst!",
    "{runner} gives everything he's got!",
    "{runner} puts in a desperate drive!",
    "{runner} goes all out for the line!",
    "{runner} throws everything at the finish!",
    "{runner} makes one last push!",
    "{runner} digs deep for the wire!"
  ],
  
  // Winning commentary
  winner: [
    "{runner} wins it!",
    "{runner} takes it!",
    "{runner} gets up!",
    "{runner} crosses the line!",
    "{runner} claims victory!",
    "{runner} secures the win!",
    "{runner} makes it across!",
    "{runner} snatches victory!",
    "{runner} captures the prize!",
    "{runner} seals the deal!"
  ]
}

// Race-specific commentary based on category
const categorySpecificPhrases = {
  horse: [
    "The thoroughbreds are flying down the track!",
    "What a magnificent display of horsemanship!",
    "The jockeys are urging their mounts forward!",
    "The field is thundering down the homestretch!",
    "What a spectacular finish from these equine athletes!"
  ],
  greyhound: [
    "The greyhounds are flying around the track!",
    "What a display of canine speed!",
    "The dogs are making their final dash!",
    "The hounds are sprinting for the finish!",
    "What a breathtaking display from these racing dogs!"
  ],
  harness: [
    "The pacers are flying down the track!",
    "What a display of harness racing!",
    "The horses and drivers are working in perfect harmony!",
    "The sulky drivers are urging their horses forward!",
    "What a masterful performance in the sulky!"
  ]
}

// Position change commentary
const positionChangePhrases = [
  "{runner} is making up ground!",
  "{runner} is charging through the field!",
  "{runner} is moving up quickly!",
  "{runner} is closing in on the leaders!",
  "{runner} is picking off runners one by one!",
  "{runner} is weaving through traffic!",
  "{runner} is finding a clear run!",
  "{runner} is making a strong move!",
  "{runner} is coming with a rush!",
  "{runner} is launching a late challenge!"
]

// Odds-related commentary
const oddsCommentary = [
  "{runner} was the favorite at {odds} to win.",
  "{runner}, the {odds} shot, is making a move.",
  "The {odds} longshot {runner} is closing in!",
  "{runner} at {odds} is showing determination.",
  "Can {runner} at {odds} pull off the upset?"
]

// Generic runner names for commentary when we don't have specific names
const genericRunners = ['the field', 'the pack', 'the runners', 'the contenders', 'the competitors']

export function useRaceCommentary() {
  // Track the last commentary to avoid repetition
  const lastCommentary = ref<string[]>([])
  const lastLeader = ref<string>('')
  const commentaryHistory = ref<string[]>([])
  
  // Generate a random commentary line from templates
  const generateCommentary = (
    templateType: keyof typeof commentaryTemplates,
    replacements: Record<string, string> = {}
  ): string => {
    const templates = commentaryTemplates[templateType]
    if (!templates || templates.length === 0) return ''
    
    // Select a random template
    const template = templates[Math.floor(Math.random() * templates.length)]
    
    // Apply replacements
    let commentary = template
    for (const [key, value] of Object.entries(replacements)) {
      commentary = commentary.replace(`{${key}}`, value)
    }
    
    return commentary
  }
  
  // Generate category-specific commentary
  const generateCategoryCommentary = (categoryId: string): string => {
    const categoryKey = getCategoryKey(categoryId)
    const phrases = categorySpecificPhrases[categoryKey]
    if (phrases && phrases.length > 0) {
      return phrases[Math.floor(Math.random() * phrases.length)]
    }
    return ''
  }
  
  // Get category key from category ID
  const getCategoryKey = (categoryId: string): 'horse' | 'greyhound' | 'harness' => {
    if (categoryId === '4a2788f8-e825-4d36-9894-efd4baf1cfae') {
      return 'horse'
    } else if (categoryId === '9daef0d7-bf3c-4f50-921d-8e818c60fe61') {
      return 'greyhound'
    } else {
      return 'harness'
    }
  }
  
  // Generate position change commentary
  const generatePositionChangeCommentary = (runnerName: string): string => {
    const phrase = positionChangePhrases[Math.floor(Math.random() * positionChangePhrases.length)]
    return phrase.replace('{runner}', runnerName)
  }
  
  // Generate odds commentary
  const generateOddsCommentary = (runnerName: string, odds: number | 'SP'): string => {
    const phrase = oddsCommentary[Math.floor(Math.random() * oddsCommentary.length)]
    const oddsString = odds === 'SP' ? 'starting price' : `${odds.toFixed(1)}`
    return phrase.replace('{runner}', runnerName).replace('{odds}', oddsString)
  }
  
  // Generate dynamic race commentary based on race progress
  const generateRaceCommentary = (
    raceId: string,
    progress: {
      progressByRunner: Record<string, number>
      order: string[]
      gaps: Record<string, number>
      etaMs: number
    },
    meetingName: string,
    raceNumber: number,
    categoryId: string
  ): string => {
    try {
      // Get runners information
      const runners = getSimulatedRunners(raceId)
      if (!runners || runners.length === 0) {
        return `${meetingName} R${raceNumber}: Race in progress`
      }
      
      // Get current leader
      const leaderId = progress.order[0]
      const leaderRunner = runners.find(r => r.id === leaderId)
      const leaderName = leaderRunner ? leaderRunner.name : 'Unknown'
      
      // Calculate race progress percentage
      const raceProgress = progress.progressByRunner[leaderId] || 0
      const timeRemaining = progress.etaMs > 0 ? progress.etaMs / 1000 : 0
      
      // Generate commentary based on race stage
      let commentary = ''
      
      // Early race commentary (0-30%)
      if (raceProgress < 0.3) {
        // Leader change or maintaining lead
        if (leaderName !== lastLeader.value) {
          commentary = generateCommentary('leaderChange', { runner: leaderName })
          lastLeader.value = leaderName
        } else {
          commentary = generateCommentary('midRace', { runner: leaderName })
        }
      }
      // Mid race commentary (30-70%)
      else if (raceProgress < 0.7) {
        // Check if race is close
        const gaps = Object.values(progress.gaps)
        const maxGap = Math.max(...gaps, 0)
        
        if (maxGap < 0.1) {
          // Close race
          commentary = generateCommentary('closeRace')
        } else if (leaderName !== lastLeader.value) {
          // Leader change
          commentary = generateCommentary('leaderChange', { runner: leaderName })
          lastLeader.value = leaderName
        } else {
          // Regular mid-race update
          commentary = generateCommentary('midRace', { runner: leaderName })
        }
        
        // Add some position change commentary occasionally
        if (Math.random() > 0.7 && progress.order.length > 1) {
          const chasingRunnerId = progress.order[1]
          const chasingRunner = runners.find(r => r.id === chasingRunnerId)
          if (chasingRunner) {
            commentary += ` ${generatePositionChangeCommentary(chasingRunner.name)}`
          }
        }
      }
      // Late race commentary (70-90%)
      else if (raceProgress < 0.9) {
        commentary = generateCommentary('finalStretch')
        
        // Add odds commentary occasionally
        if (Math.random() > 0.8 && leaderRunner) {
          commentary += ` ${generateOddsCommentary(leaderRunner.name, leaderRunner.odds)}`
        }
      }
      // Final stretch commentary (90%+)
      else {
        if (timeRemaining < 10) {
          // Sprint finish
          commentary = generateCommentary('sprintFinish', { runner: leaderName })
        } else {
          // Regular final stretch
          commentary = generateCommentary('finalStretch')
        }
      }
      
      // Add category-specific flavor occasionally
      if (Math.random() > 0.8) {
        const categoryCommentary = generateCategoryCommentary(categoryId)
        if (categoryCommentary) {
          commentary = `${categoryCommentary} ${commentary}`
        }
      }
      
      // Avoid repetition by checking history
      if (commentaryHistory.value.includes(commentary)) {
        // If we've used this commentary recently, try to generate a different one
        // or fall back to a simple leader update
        commentary = `${meetingName} R${raceNumber}: ${leaderName} leads`
      }
      
      // Add to history (keep last 5 commentaries)
      commentaryHistory.value.push(commentary)
      if (commentaryHistory.value.length > 5) {
        commentaryHistory.value.shift()
      }
      
      return `${meetingName} R${raceNumber}: ${commentary}`
    } catch (error) {
      // Fallback to simple commentary if there's an error
      return `${meetingName} R${raceNumber}: Race in progress`
    }
  }
  
  // Generate winner announcement
  const generateWinnerAnnouncement = (
    raceId: string,
    winnerId: string,
    meetingName: string,
    raceNumber: number
  ): string => {
    try {
      const runners = getSimulatedRunners(raceId)
      const winnerRunner = runners.find(r => r.id === winnerId)
      const winnerName = winnerRunner ? winnerRunner.name : 'Unknown'
      
      const winnerCommentary = generateCommentary('winner', { runner: winnerName })
      const categoryCommentary = generateCategoryCommentary('horse') // Default to horse for winner
      
      return `${meetingName} R${raceNumber}: ${winnerCommentary} ${categoryCommentary}`
    } catch (error) {
      return `${meetingName} R${raceNumber}: Race finished`
    }
  }
  
  return {
    generateRaceCommentary,
    generateWinnerAnnouncement,
    generateCategoryCommentary
  }
}