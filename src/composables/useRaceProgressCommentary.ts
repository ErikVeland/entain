import { getSimulatedRunners } from './useOddsSimulation'
import { useCategoryCommentary } from './useCategoryCommentary'

export const useRaceProgressCommentary = () => {
  const { getCategoryCommentary } = useCategoryCommentary()

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
    const leaderRunner = runners.find((r: any) => r.id === leaderId);
    
    if (!leaderRunner) {
      return `${meetingName} R${raceNumber} is in progress`;
    }
    
    // Check race progress to determine commentary type
    const raceProgress = progress.tElapsedMs / progress.tTotalMs;
    
    // Early race commentary (first 30%)
    if (raceProgress < 0.3) {
      const earlyOptions = [
        `${leaderRunner.name} sets the early pace in ${meetingName} R${raceNumber}`,
        `${leaderRunner.name} takes an early lead in ${meetingName} R${raceNumber}`,
        `${leaderRunner.name} is dictating the tempo early in ${meetingName} R${raceNumber}`,
        `Early leader ${leaderRunner.name} is showing the way in ${meetingName} R${raceNumber}`,
        `${leaderRunner.name} has established an early advantage in ${meetingName} R${raceNumber}`
      ];
      
      // Add odds-based commentary for early leaders
      if (typeof leaderRunner.odds === 'number') {
        if (leaderRunner.odds < 3) {
          earlyOptions.push(
            `Hot favorite ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) sets the early pace in ${meetingName} R${raceNumber}`,
            `Market leader ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) takes an early lead in ${meetingName} R${raceNumber}`
          );
        } else if (leaderRunner.odds > 10) {
          earlyOptions.push(
            `Shock leader ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) is showing the way early in ${meetingName} R${raceNumber}`,
            `Outside chance ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) has taken an early lead in ${meetingName} R${raceNumber}`
          );
        } else {
          earlyOptions.push(
            `${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) sets the early pace in ${meetingName} R${raceNumber}`,
            `Favorite ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) takes an early lead in ${meetingName} R${raceNumber}`
          );
        }
      }
      
      return earlyOptions[Math.floor(Math.random() * earlyOptions.length)];
    }
    
    // Mid race commentary (30-70%)
    if (raceProgress < 0.7) {
      // Check for close competition
      if (progress.order.length > 1 && progress.gaps) {
        const secondId = progress.order[1];
        const gap = Math.abs(progress.gaps[leaderId] - progress.gaps[secondId]);
        const secondRunner = runners.find((r: any) => r.id === secondId);
        
        if (secondRunner) {
          if (gap < 0.1) {
            const neckAndNeckOptions = [
              `${leaderRunner.name} and ${secondRunner.name} are neck and neck in ${meetingName} R${raceNumber}!`,
              `${leaderRunner.name} and ${secondRunner.name} are running stride for stride in ${meetingName} R${raceNumber}!`,
              `${leaderRunner.name} and ${secondRunner.name} are locked in a fierce battle in ${meetingName} R${raceNumber}!`,
              `${leaderRunner.name} and ${secondRunner.name} are trading blows at the front in ${meetingName} R${raceNumber}!`,
              `${leaderRunner.name} and ${secondRunner.name} are inseparable at the lead in ${meetingName} R${raceNumber}!`,
              `${leaderRunner.name} and ${secondRunner.name} are matching each other move for move in ${meetingName} R${raceNumber}!`,
              `${leaderRunner.name} and ${secondRunner.name} are in a photo finish battle in ${meetingName} R${raceNumber}!`
            ];
            
            // Add odds-based commentary for close competition
            if (typeof leaderRunner.odds === 'number' && typeof secondRunner.odds === 'number') {
              if (leaderRunner.odds < secondRunner.odds) {
                neckAndNeckOptions.push(
                  `${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) is holding off the challenge from ${secondRunner.name} (${secondRunner.odds.toFixed(2)}) in ${meetingName} R${raceNumber}!`,
                  `Market leader ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) is just ahead of ${secondRunner.name} (${secondRunner.odds.toFixed(2)}) in ${meetingName} R${raceNumber}!`
                );
              } else {
                neckAndNeckOptions.push(
                  `${secondRunner.name} (${secondRunner.odds.toFixed(2)}) is pressing hard on favorite ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) in ${meetingName} R${raceNumber}!`,
                  `Underdog ${secondRunner.name} (${secondRunner.odds.toFixed(2)}) is making ground on the leader ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) in ${meetingName} R${raceNumber}!`
                );
              }
            }
            
            return neckAndNeckOptions[Math.floor(Math.random() * neckAndNeckOptions.length)];
          } else if (gap < 0.3) {
            const narrowLeadOptions = [
              `${leaderRunner.name} holds a narrow lead over ${secondRunner.name} in ${meetingName} R${raceNumber}`,
              `${leaderRunner.name} edges ahead of ${secondRunner.name} in ${meetingName} R${raceNumber}`,
              `${leaderRunner.name} maintains a slender advantage over ${secondRunner.name} in ${meetingName} R${raceNumber}`,
              `${leaderRunner.name} clings to a precarious lead over ${secondRunner.name} in ${meetingName} R${raceNumber}`,
              `${leaderRunner.name} just holds the advantage over ${secondRunner.name} in ${meetingName} R${raceNumber}`,
              `${leaderRunner.name} has a slight edge over ${secondRunner.name} in ${meetingName} R${raceNumber}`,
              `${leaderRunner.name} is barely ahead of ${secondRunner.name} in ${meetingName} R${raceNumber}`
            ];
            
            // Add odds-based commentary for narrow leads
            if (typeof leaderRunner.odds === 'number' && typeof secondRunner.odds === 'number') {
              if (leaderRunner.odds < secondRunner.odds) {
                narrowLeadOptions.push(
                  `${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) is holding off ${secondRunner.name} (${secondRunner.odds.toFixed(2)}) in ${meetingName} R${raceNumber}!`,
                  `Favorite ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) clings to the lead over ${secondRunner.name} (${secondRunner.odds.toFixed(2)}) in ${meetingName} R${raceNumber}!`
                );
              } else {
                narrowLeadOptions.push(
                  `${secondRunner.name} (${secondRunner.odds.toFixed(2)}) is closing on ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) in ${meetingName} R${raceNumber}!`,
                  `Underdog ${secondRunner.name} (${secondRunner.odds.toFixed(2)}) is pressing the favorite ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) in ${meetingName} R${raceNumber}!`
                );
              }
            }
            
            return narrowLeadOptions[Math.floor(Math.random() * narrowLeadOptions.length)];
          } else {
            const clearLeadOptions = [
              `${leaderRunner.name} has opened up a clear lead over ${secondRunner.name} in ${meetingName} R${raceNumber}`,
              `${leaderRunner.name} has established a commanding advantage over ${secondRunner.name} in ${meetingName} R${raceNumber}`,
              `${leaderRunner.name} is pulling away from ${secondRunner.name} at the front in ${meetingName} R${raceNumber}`,
              `${leaderRunner.name} has broken clear at the head of the field over ${secondRunner.name} in ${meetingName} R${raceNumber}`,
              `${leaderRunner.name} is striding away from the competition led by ${secondRunner.name} in ${meetingName} R${raceNumber}`,
              `${leaderRunner.name} has built a substantial lead over ${secondRunner.name} in ${meetingName} R${raceNumber}`,
              `${leaderRunner.name} is dominating the field with ${secondRunner.name} in pursuit in ${meetingName} R${raceNumber}`
            ];
            
            // Add odds-based commentary for clear leads
            if (typeof leaderRunner.odds === 'number' && typeof secondRunner.odds === 'number') {
              if (leaderRunner.odds < secondRunner.odds) {
                clearLeadOptions.push(
                  `${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) has broken clear of ${secondRunner.name} (${secondRunner.odds.toFixed(2)}) in ${meetingName} R${raceNumber}!`,
                  `Market leader ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) is striding away from ${secondRunner.name} (${secondRunner.odds.toFixed(2)}) in ${meetingName} R${raceNumber}!`
                );
              } else {
                clearLeadOptions.push(
                  `Shock leader ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) has opened a gap on ${secondRunner.name} (${secondRunner.odds.toFixed(2)}) in ${meetingName} R${raceNumber}!`,
                  `Underdog ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) is pulling away from favorite ${secondRunner.name} (${secondRunner.odds.toFixed(2)}) in ${meetingName} R${raceNumber}!`
                );
              }
            }
            
            return clearLeadOptions[Math.floor(Math.random() * clearLeadOptions.length)];
          }
        }
      }
      
      // Default mid-race leader commentary
      const midRaceOptions = [
        `${leaderRunner.name} is leading ${meetingName} R${raceNumber} at the halfway mark`,
        `${leaderRunner.name} holds the lead in ${meetingName} R${raceNumber} mid-race`,
        `${leaderRunner.name} maintains the advantage in ${meetingName} R${raceNumber} at this stage`,
        `${leaderRunner.name} continues to lead ${meetingName} R${raceNumber} in the middle stages`,
        `${leaderRunner.name} is setting the pace at the front of ${meetingName} R${raceNumber} mid-race`,
        `${leaderRunner.name} is showing the way at the head of the field in ${meetingName} R${raceNumber} at halfway`,
        `${leaderRunner.name} is dictating the tempo from the front in ${meetingName} R${raceNumber} mid-race`
      ];
      
      // Add odds-based commentary for mid-race leaders
      if (typeof leaderRunner.odds === 'number') {
        midRaceOptions.push(
          `${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) is leading ${meetingName} R${raceNumber} at the halfway mark`,
          `Market leader ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) holds the advantage in ${meetingName} R${raceNumber} mid-race`,
          `Favorite ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) continues to lead ${meetingName} R${raceNumber} in the middle stages`
        );
      }
      
      return midRaceOptions[Math.floor(Math.random() * midRaceOptions.length)];
    }
    
    // Late race commentary (final 30%)
    // Check for close competition in the final stages
    if (progress.order.length > 1 && progress.gaps) {
      const secondId = progress.order[1];
      const gap = Math.abs(progress.gaps[leaderId] - progress.gaps[secondId]);
      const secondRunner = runners.find((r: any) => r.id === secondId);
      
      if (secondRunner) {
        if (gap < 0.15) {
          const lateBattleOptions = [
            `${leaderRunner.name} and ${secondRunner.name} are in a thrilling battle in the final stages of ${meetingName} R${raceNumber}!`,
            `${leaderRunner.name} and ${secondRunner.name} are locked in a dramatic duel in ${meetingName} R${raceNumber}!`,
            `${leaderRunner.name} and ${secondRunner.name} are trading final blows at the front in ${meetingName} R${raceNumber}!`,
            `A sensational finish brewing between ${leaderRunner.name} and ${secondRunner.name} in ${meetingName} R${raceNumber}!`,
            `${leaderRunner.name} and ${secondRunner.name} are in a photo finish battle in the closing stages of ${meetingName} R${raceNumber}!`,
            `The most exciting finish of the day between ${leaderRunner.name} and ${secondRunner.name} in ${meetingName} R${raceNumber}!`
          ];
          
          // Add odds-based commentary for late battles
          if (typeof leaderRunner.odds === 'number' && typeof secondRunner.odds === 'number') {
            if (leaderRunner.odds < secondRunner.odds) {
              lateBattleOptions.push(
                `${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) is holding off the late charge from ${secondRunner.name} (${secondRunner.odds.toFixed(2)}) in ${meetingName} R${raceNumber}!`,
                `Market leader ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) is just ahead of ${secondRunner.name} (${secondRunner.odds.toFixed(2)}) in the final stages of ${meetingName} R${raceNumber}!`
              );
            } else {
              lateBattleOptions.push(
                `${secondRunner.name} (${secondRunner.odds.toFixed(2)}) is making a late surge on favorite ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) in ${meetingName} R${raceNumber}!`,
                `Underdog ${secondRunner.name} (${secondRunner.odds.toFixed(2)}) is closing fast on the leader ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) in ${meetingName} R${raceNumber}!`
              );
            }
          }
          
          return lateBattleOptions[Math.floor(Math.random() * lateBattleOptions.length)];
        } else if (gap < 0.4) {
          const lateLeadOptions = [
            `${leaderRunner.name} holds a narrow lead over ${secondRunner.name} in the closing stages of ${meetingName} R${raceNumber}`,
            `${leaderRunner.name} edges ahead of ${secondRunner.name} in the final stages of ${meetingName} R${raceNumber}`,
            `${leaderRunner.name} maintains a slender advantage over ${secondRunner.name} in ${meetingName} R${raceNumber} late`,
            `${leaderRunner.name} clings to a precarious lead over ${secondRunner.name} in ${meetingName} R${raceNumber} final stages`,
            `${leaderRunner.name} just holds the advantage over ${secondRunner.name} in the closing stages of ${meetingName} R${raceNumber}`
          ];
          
          // Add odds-based commentary for late narrow leads
          if (typeof leaderRunner.odds === 'number' && typeof secondRunner.odds === 'number') {
            if (leaderRunner.odds < secondRunner.odds) {
              lateLeadOptions.push(
                `${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) is holding off ${secondRunner.name} (${secondRunner.odds.toFixed(2)}) in the final stages of ${meetingName} R${raceNumber}!`,
                `Favorite ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) clings to the lead over ${secondRunner.name} (${secondRunner.odds.toFixed(2)}) in ${meetingName} R${raceNumber} late!`
              );
            } else {
              lateLeadOptions.push(
                `${secondRunner.name} (${secondRunner.odds.toFixed(2)}) is closing on ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) in the closing stages of ${meetingName} R${raceNumber}!`,
                `Underdog ${secondRunner.name} (${secondRunner.odds.toFixed(2)}) is pressing the favorite ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) in ${meetingName} R${raceNumber} final stages!`
              );
            }
          }
          
          return lateLeadOptions[Math.floor(Math.random() * lateLeadOptions.length)];
        }
      }
    }
    
    // Default late race leader commentary
    const lateRaceOptions = [
      `${leaderRunner.name} has a commanding lead in the final stages of ${meetingName} R${raceNumber}`,
      `${leaderRunner.name} is pulling away in the closing stages of ${meetingName} R${raceNumber}`,
      `${leaderRunner.name} has broken clear in the final stages of ${meetingName} R${raceNumber}`,
      `${leaderRunner.name} is striding away in ${meetingName} R${raceNumber} final stages`,
      `${leaderRunner.name} has built a substantial lead in the closing stages of ${meetingName} R${raceNumber}`
    ];
    
    // Add odds-based commentary for late race leaders
    if (typeof leaderRunner.odds === 'number') {
      lateRaceOptions.push(
        `${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) has a commanding lead in the final stages of ${meetingName} R${raceNumber}`,
        `Market leader ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) is pulling away in the closing stages of ${meetingName} R${raceNumber}`,
        `Favorite ${leaderRunner.name} (${leaderRunner.odds.toFixed(2)}) has broken clear in the final stages of ${meetingName} R${raceNumber}`
      );
    }
    
    return lateRaceOptions[Math.floor(Math.random() * lateRaceOptions.length)];
  }

  return {
    generateRaceCommentary
  }
}