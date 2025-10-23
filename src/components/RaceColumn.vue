<template>
  <div 
    class="bg-surface-raised rounded-xl2 shadow-card overflow-hidden transition-all duration-300"
    :class="{ 'ring-2 ring-brand-primary': isActive }"
  >
    <RaceHeader 
      :meeting-name="race.meeting_name"
      :race-number="race.race_number"
      :category-id="race.category_id"
      :start-time="race.advertised_start_ms"
    />
    
    <div class="p-3">
      <div class="space-y-2">
        <RunnerRow 
          v-for="(runner, index) in runners"
          :key="index"
          :runner="runner"
        />
      </div>
    </div>
    
    <BetPlacer 
      :race-id="race.id"
      :runners="runners"
    />
    
    <RaceResults 
      v-if="raceResult"
      :race-id="race.id"
      :runners="runners"
      :race-result="raceResult"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { type RaceSummary } from '../stores/races'
import RaceHeader from './RaceHeader.vue'
import RunnerRow from './RunnerRow.vue'
import BetPlacer from './BetPlacer.vue'
import RaceResults from './RaceResults.vue'

const props = defineProps<{
  race: RaceSummary
  isActive?: boolean
}>()

// Mock runners data - in a real implementation, this would come from the API
const runners = computed(() => {
  // This is placeholder data - in a real app, you would fetch runners for each race
  return [
    {
      id: `${props.race.id}-runner-1`,
      number: 1,
      name: 'Thunder Bay',
      weight: '58kg',
      jockey: 'J: R Vaibhav',
      odds: 2.40,
      oddsTrend: 'up',
      silkColor: 'bg-blue-500'
    },
    {
      id: `${props.race.id}-runner-2`,
      number: 2,
      name: 'Midnight Express',
      weight: '56kg',
      jockey: 'J: Sarah Johnson',
      odds: 3.40,
      oddsTrend: 'down',
      silkColor: 'bg-green-500'
    },
    {
      id: `${props.race.id}-runner-3`,
      number: 3,
      name: 'Desert Storm',
      weight: '57kg',
      jockey: 'J: Michael Chen',
      odds: 11.00,
      oddsTrend: 'up',
      silkColor: 'bg-pink-500'
    },
    {
      id: `${props.race.id}-runner-4`,
      number: 4,
      name: 'Got Immunity',
      weight: '55kg',
      jockey: 'J: Emma Wilson',
      odds: 'SP',
      oddsTrend: 'none',
      silkColor: 'bg-yellow-500'
    }
  ]
})

// Mock race result - in a real implementation, this would come from the race simulation
const raceResult = ref<{ placings: string[] } | null>(null)

// In a real implementation, this would be set when the race simulation finishes
// For now, we'll just set it after a delay to simulate race completion
setTimeout(() => {
  raceResult.value = {
    placings: [
      `${props.race.id}-runner-2`, // Midnight Express wins
      `${props.race.id}-runner-1`, // Thunder Bay second
      `${props.race.id}-runner-4`, // Got Immunity third
      `${props.race.id}-runner-3`  // Desert Storm fourth
    ]
  }
}, 30000) // Simulate race finishing after 30 seconds