import { getSimulatedRunners } from './useOddsSimulation'

export const useWinnerCommentary = () => {
  const generateWinnerAnnouncement = (raceId: string, winnerId: string, meetingName: string, raceNumber: number): string => {
    const runners = getSimulatedRunners(raceId);
    if (!runners || runners.length === 0) {
      return `${meetingName} R${raceNumber}: Race finished`;
    }
    
    const winnerRunner = runners.find((r: any) => r.id === winnerId);
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

  return {
    generateWinnerAnnouncement
  }
}