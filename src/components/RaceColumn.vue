<template>
  <div class="bg-surface-raised rounded-xl2 shadow-card overflow-hidden transition-all duration-300">
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { type RaceSummary } from '../stores/races'
import RaceHeader from './RaceHeader.vue'
import RunnerRow from './RunnerRow.vue'

const props = defineProps<{
  race: RaceSummary
}>()

// Mock runners data - in a real implementation, this would come from the API
const runners = computed(() => {
  // This is placeholder data - in a real app, you would fetch runners for each race
  return [
    {
      number: 1,
      name: 'Thunder Bay',
      weight: '58kg',
      jockey: 'J: R Vaibhav',
      odds: '2.40',
      oddsTrend: 'up',
      silkColor: 'bg-blue-500'
    },
    {
      number: 2,
      name: 'Midnight Express',
      weight: '56kg',
      jockey: 'J: Sarah Johnson',
      odds: '3.40',
      oddsTrend: 'down',
      silkColor: 'bg-green-500'
    },
    {
      number: 3,
      name: 'Desert Storm',
      weight: '57kg',
      jockey: 'J: Michael Chen',
      odds: '11.00',
      oddsTrend: 'up',
      silkColor: 'bg-pink-500'
    },
    {
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
</script>