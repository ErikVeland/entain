export const useStartFinishCommentary = () => {
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
    
    return commentaryOptions[Math.floor(Math.random() * commentaryOptions.length)]
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
    
    return commentaryOptions[Math.floor(Math.random() * commentaryOptions.length)]
  }

  return {
    generateStartCommentary,
    generateFinishCommentary
  }
}