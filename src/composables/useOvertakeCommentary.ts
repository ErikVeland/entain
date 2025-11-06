import { getSimulatedRunners } from './useOddsSimulation'

export const useOvertakeCommentary = () => {
  const generateOvertakeCommentary = (raceId: string, progress: any) => {
    if (!progress || !progress.order || progress.order.length < 2) return null
    
    const runners = getSimulatedRunners(raceId)
    if (!runners || runners.length === 0) return null
    
    // Check for significant position changes
    const leaderId = progress.order[0]
    const secondId = progress.order[1]
    
    const leaderRunner = runners.find((r: any) => r.id === leaderId)
    const secondRunner = runners.find((r: any) => r.id === secondId)
    
    if (!leaderRunner || !secondRunner) return null
    
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
    
    return commentaryOptions[Math.floor(Math.random() * commentaryOptions.length)]
  }

  return {
    generateOvertakeCommentary
  }
}