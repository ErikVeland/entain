<template>
  <div class="bg-surface-raised rounded-xl2 p-4 shadow-card">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-text-base">Odds Movement</h3>
      <div class="flex space-x-2">
        <button 
          @click="timeRange = '5m'"
          class="px-2 py-1 text-xs rounded"
          :class="timeRange === '5m' ? 'bg-brand-primary text-text-inverse' : 'bg-surface text-text-base'"
        >
          5m
        </button>
        <button 
          @click="timeRange = '15m'"
          class="px-2 py-1 text-xs rounded"
          :class="timeRange === '15m' ? 'bg-brand-primary text-text-inverse' : 'bg-surface text-text-base'"
        >
          15m
        </button>
        <button 
          @click="timeRange = '30m'"
          class="px-2 py-1 text-xs rounded"
          :class="timeRange === '30m' ? 'bg-brand-primary text-text-inverse' : 'bg-surface text-text-base'"
        >
          30m
        </button>
      </div>
    </div>
    <div class="h-64">
      <Line 
        v-if="loaded && chartData.datasets.length > 0 && showChart"
        :data="chartData" 
        :options="chartOptions"
      />
      <div v-else class="flex items-center justify-center h-full text-text-muted">
        <div class="text-center">
          <p>Loading odds movement data...</p>
          <div class="mt-2 w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  Scale
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { useBetsStore } from '../stores/bets'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler)

const props = defineProps<{
  raceId: string
}>()

const betsStore = useBetsStore()

// Only show chart in simulation mode
const showChart = computed(() => {
  return betsStore.showGame && betsStore.useSimulatedData
})

const timeRange = ref<'5m' | '15m' | '30m'>('15m')
const mockOddsData = ref<Record<string, { time: number; odds: number }[]>>({})
const loaded = ref(false)

// Generate mock data
onMounted(() => {
  // Only initialize mock data if in simulation mode
  if (showChart.value) {
    // Simulate fetching odds history data
    setTimeout(() => {
      // Generate mock odds data for 4 runners
      const runners = ['Thunder Bay', 'Midnight Express', 'Desert Storm', 'Got Immunity']
      const now = Date.now()
      
      runners.forEach((runner, index) => {
        mockOddsData.value[runner] = []
        const baseOdds = [2.4, 3.4, 11.0, 6.0][index]
        
        // Generate data points based on selected time range
        const points = timeRange.value === '5m' ? 10 : timeRange.value === '15m' ? 15 : 30
        const interval = timeRange.value === '5m' ? 30000 : timeRange.value === '15m' ? 60000 : 60000
        
        for (let i = 0; i < points; i++) {
          const time = now - ((points - i) * interval)
          const trend = index === 0 ? -0.1 : index === 1 ? -0.05 : index === 2 ? 0.1 : 0
          const fluctuation = (Math.random() - 0.5) * 0.3
          const odds = Math.max(1.1, baseOdds + (i * trend * 0.1) + fluctuation)
          
          mockOddsData.value[runner].push({
            time,
            odds: parseFloat(odds.toFixed(2))
          })
        }
      })
      
      loaded.value = true
    }, 800)
  }
})

// Watch for time range changes
watch(timeRange, () => {
  // Only update mock data if in simulation mode
  if (showChart.value) {
    loaded.value = false
    setTimeout(() => {
      // In a real implementation, we would fetch new data based on the time range
      // For now, we'll just regenerate mock data
      const runners = Object.keys(mockOddsData.value)
      const now = Date.now()
      
      runners.forEach((runner, index) => {
        mockOddsData.value[runner] = []
        const baseOdds = [2.4, 3.4, 11.0, 6.0][index]
        
        const points = timeRange.value === '5m' ? 10 : timeRange.value === '15m' ? 15 : 30
        const interval = timeRange.value === '5m' ? 30000 : timeRange.value === '15m' ? 60000 : 60000
        
        for (let i = 0; i < points; i++) {
          const time = now - ((points - i) * interval)
          const trend = index === 0 ? -0.1 : index === 1 ? -0.05 : index === 2 ? 0.1 : 0
          const fluctuation = (Math.random() - 0.5) * 0.3
          const odds = Math.max(1.1, baseOdds + (i * trend * 0.1) + fluctuation)
          
          mockOddsData.value[runner].push({
            time,
            odds: parseFloat(odds.toFixed(2))
          })
        }
      })
      
      loaded.value = true
    }, 500)
  }
})

const chartData = computed(() => {
  if (!loaded.value) {
    return {
      labels: [],
      datasets: []
    }
  }
  
  // Create time labels (last 10 points)
  const timeLabels: string[] = []
  const runners = Object.keys(mockOddsData.value)
  
  if (runners.length > 0 && mockOddsData.value[runners[0]].length > 0) {
    const dataPoints = mockOddsData.value[runners[0]]
    dataPoints.forEach((point, index) => {
      // Show fewer labels to avoid clutter
      if (index % 2 === 0 || index === dataPoints.length - 1) {
        const date = new Date(point.time)
        timeLabels.push(`${date.getMinutes()}:${date.getSeconds().toString().padStart(2, '0')}`)
      } else {
        timeLabels.push('')
      }
    })
  }
  
  // Create datasets for each runner
  const datasets = runners.map((runner, index) => {
    const colors = [
      'rgb(249, 115, 22)', // brand-primary (orange)
      'rgb(15, 23, 42)',   // brand-secondary (dark blue)
      'rgb(250, 204, 21)', // brand-accent (yellow)
      'rgb(22, 163, 74)'   // success (green)
    ]
    
    const backgroundColors = [
      'rgba(249, 115, 22, 0.1)',
      'rgba(15, 23, 42, 0.1)',
      'rgba(250, 204, 21, 0.1)',
      'rgba(22, 163, 74, 0.1)'
    ]
    
    return {
      label: runner,
      data: mockOddsData.value[runner].map(point => point.odds),
      borderColor: colors[index],
      backgroundColor: backgroundColors[index],
      borderWidth: 2,
      pointRadius: 3,
      pointBackgroundColor: colors[index],
      fill: false,
      tension: 0.4 // Smooth curves
    }
  })
  
  return {
    labels: timeLabels,
    datasets
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false
  },
  plugins: {
    legend: {
      labels: {
        color: '#F8FAFC', // text-text-base
        usePointStyle: true,
        padding: 20
      }
    },
    tooltip: {
      backgroundColor: '#111827', // surface-raised
      titleColor: '#F8FAFC', // text-text-base
      bodyColor: '#F8FAFC', // text-text-base
      borderColor: '#F97316', // brand-primary
      borderWidth: 1,
      padding: 12,
      usePointStyle: true
    }
  },
  scales: {
    x: {
      ticks: {
        color: '#94A3B8', // text-text-muted
        maxRotation: 0,
        autoSkip: false
      },
      grid: {
        color: 'rgba(148, 163, 184, 0.1)', // text-text-muted with opacity
        drawBorder: false
      },
      title: {
        display: true,
        text: 'Time',
        color: '#F8FAFC' // text-text-base
      }
    },
    y: {
      ticks: {
        color: '#94A3B8', // text-text-muted
        callback: function(this: Scale, tickValue: string | number, index: number, ticks: any[]) {
          const numValue = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue
          return numValue.toFixed(2)
        }
      },
      grid: {
        color: 'rgba(148, 163, 184, 0.1)', // text-text-muted with opacity
        drawBorder: false
      },
      title: {
        display: true,
        text: 'Decimal Odds',
        color: '#F8FAFC' // text-text-base
      }
    }
  }
}
</script>