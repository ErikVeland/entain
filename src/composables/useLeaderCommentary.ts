import { getSimulatedRunners } from './useOddsSimulation'

export const useLeaderCommentary = () => {
  const generateLeaderUpdate = (raceId: string, progress: any) => {
    if (!progress || !progress.order || progress.order.length === 0) return null
    
    const runners = getSimulatedRunners(raceId)
    if (!runners || runners.length === 0) return null
    
    const leaderId = progress.order[0]
    const leaderRunner = runners.find((r: any) => r.id === leaderId)
    if (!leaderRunner) return null
    
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
    
    return commentaryOptions[Math.floor(Math.random() * commentaryOptions.length)]
  }

  return {
    generateLeaderUpdate
  }
}