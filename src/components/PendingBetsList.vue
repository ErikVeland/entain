<script setup lang="ts">
import { useBetsStore } from '../stores/bets'
import { type Bet, type SingleBet, type MultiBet, type ExoticBet } from '../game/bettingSimulator'

const props = defineProps<{
  bets: Bet[]
}>()

const betsStore = useBetsStore()

// Methods to extract data from different bet types
const getRunnerName = (bet: Bet) => {
  if (bet.type === 'WIN' || bet.type === 'PLACE' || bet.type === 'EACH_WAY') {
    const singleBet = bet as SingleBet;
    return singleBet.leg?.selectionName || 'Unknown Runner';
  } else if (bet.type === 'MULTI' && (bet as MultiBet).legs.length > 0) {
    const multiBet = bet as MultiBet;
    return multiBet.legs[0]?.selectionName || 'Unknown Runner';
  } else if (['QUINELLA', 'TRIFECTA', 'FIRST_FOUR'].includes(bet.type) && (bet as ExoticBet).legs.length > 0) {
    const exoticBet = bet as ExoticBet;
    return exoticBet.legs[0]?.selectionName || 'Unknown Runner';
  }
  return 'Unknown Runner';
}

const getMeetingName = (bet: Bet) => {
  if (bet.type === 'WIN' || bet.type === 'PLACE' || bet.type === 'EACH_WAY') {
    const singleBet = bet as SingleBet;
    return singleBet.leg?.raceId ? `Race ${singleBet.leg.raceId.substring(0, 8)}` : 'Unknown Meeting';
  } else if (bet.type === 'MULTI' && (bet as MultiBet).legs.length > 0) {
    const multiBet = bet as MultiBet;
    return multiBet.legs[0]?.raceId ? `Race ${multiBet.legs[0].raceId.substring(0, 8)}` : 'Unknown Meeting';
  } else if (['QUINELLA', 'TRIFECTA', 'FIRST_FOUR'].includes(bet.type) && (bet as ExoticBet).legs.length > 0) {
    const exoticBet = bet as ExoticBet;
    return exoticBet.legs[0]?.raceId ? `Race ${exoticBet.legs[0].raceId.substring(0, 8)}` : 'Unknown Meeting';
  }
  return 'Unknown Meeting';
}

const getRaceNumber = (bet: Bet) => {
  // For now, default to 1 as we don't have race number information in the bet object
  return 1;
}

const getStake = (bet: Bet) => {
  return bet.stake || 0;
}

const getOdds = (bet: Bet) => {
  if (bet.type === 'WIN' || bet.type === 'PLACE' || bet.type === 'EACH_WAY') {
    const singleBet = bet as SingleBet;
    return singleBet.leg?.oddsDecimalAtPlacement || 'SP';
  } else if (bet.type === 'MULTI' && (bet as MultiBet).legs.length > 0) {
    const multiBet = bet as MultiBet;
    return multiBet.legs[0]?.oddsDecimalAtPlacement || 'SP';
  } else if (['QUINELLA', 'TRIFECTA', 'FIRST_FOUR'].includes(bet.type) && (bet as ExoticBet).legs.length > 0) {
    const exoticBet = bet as ExoticBet;
    return exoticBet.legs[0]?.oddsDecimalAtPlacement || 'SP';
  }
  return 'SP';
}

const formatOdds = (odds: number | 'SP') => {
  return odds === 'SP' ? 'SP' : odds.toFixed(2)
}

const cancelBet = (betId: string) => {
  betsStore.cancelBet(betId)
}
</script>