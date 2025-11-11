<template>
  <div v-if="showChart" class="h-64 w-full flex flex-col">
    <!-- Time range controls -->
    <div v-if="loaded" class="flex justify-end mb-2">
      <div class="flex bg-surface-sunken rounded-lg p-1">
        <button
          v-for="range in timeRanges"
          :key="range.value"
          @click="timeRange = range.value as '5m' | '15m' | '30m'"
          class="px-3 py-1 text-xs rounded-md transition-colors"
          :class="timeRange === range.value 
            ? 'bg-brand-primary text-text-inverse' 
            : 'text-text-muted hover:bg-surface-raised'"
        >
          {{ range.label }}
        </button>
      </div>
    </div>
    
    <div v-if="loaded" class="flex-grow">
      <Line 
        :data="chartData" 
        :options="chartOptions"
        ref="chartRef"
      />
    </div>
    <div v-else class="h-full flex items-center justify-center">
      <div class="text-text-muted">Loading chart data...</div>
    </div>
  </div>
  <div v-else class="h-64 w-full flex items-center justify-center">
    <div class="text-text-muted">Chart not available in API mode</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
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
  Scale,
  ChartOptions
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { useBetsStore } from '../stores/bets'
import { getSimulatedRunners } from '../composables/useOddsSimulation'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler)

const props = defineProps<{
  raceId: string
}>()

const betsStore = useBetsStore()

// Add a ref to track chart updates
const isUpdatingChart = ref(false)

// Only show chart in simulation mode
const showChart = computed(() => {
  return betsStore.showGame && betsStore.useSimulatedData
})

const timeRange = ref<'5m' | '15m' | '30m'>('15m')

// Time range options
const timeRanges = [
  { label: '5m', value: '5m' as const },
  { label: '15m', value: '15m' as const },
  { label: '30m', value: '30m' as const }
]
const oddsHistory = ref<Record<string, { time: number; odds: number }[]>>({})
const loaded = ref(false)
const updateCounter = ref(0) // Force updates

// Initialize odds history for runners
const initializeOddsHistory = () => {
  if (!showChart.value) return
  
  const runners = getSimulatedRunners(props.raceId)
  if (runners.length === 0) return
  
  // Initialize history for each runner
  runners.forEach((runner) => {
    if (!oddsHistory.value[runner.id]) {
      oddsHistory.value[runner.id] = []
    }
    
    // Add initial odds point
    // Runners should already be initialized with numeric odds values
    const currentOdds = typeof runner.odds === 'number' ? runner.odds : 6.0 // Fallback to 6.0 if somehow 'SP'
    oddsHistory.value[runner.id].push({
      time: Date.now(),
      odds: currentOdds
    })
  })
  
  loaded.value = true
}

// Update odds history when runners change
const updateOddsHistory = () => {
  if (!showChart.value) return
  
  const runners = getSimulatedRunners(props.raceId)
  if (runners.length === 0) return
  
  // ONLY update odds history for upcoming races (countdown status)
  // For live/running races, show locked data from race start
  const raceElement = document.querySelector(`[data-race-id="${props.raceId}"]`);
  let isRaceCountdown = false;
  if (raceElement) {
    const raceStatus = raceElement.getAttribute('data-race-status');
    // Update for countdown races (upcoming races)
    isRaceCountdown = raceStatus === 'countdown';
  }
  
  // DO NOT update odds history if race is not in countdown status
  // This ensures locked data is shown for live/running races
  if (!isRaceCountdown) {
    // Skipping odds history update for non-countdown race - showing locked data
    return
  }
  
  const now = Date.now()
  
  runners.forEach((runner) => {
    // Runners should already be initialized with numeric odds values
    const currentOdds = typeof runner.odds === 'number' ? runner.odds : 6.0 // Fallback to 6.0 if somehow 'SP'
    const oddsValue = currentOdds
    
    // Add new data point
    if (!oddsHistory.value[runner.id]) {
      oddsHistory.value[runner.id] = []
    }
    
    oddsHistory.value[runner.id].push({
      time: now,
      odds: oddsValue
    })
    
    // Limit history to prevent memory issues (keep last 30 points instead of 50)
    if (oddsHistory.value[runner.id].length > 30) {
      oddsHistory.value[runner.id].shift()
    }
  })
  
  // Force chart update
  updateCounter.value++
  // Updated odds history for countdown race with runners
}

// Watch for runner changes to update odds history
let watchStopper: (() => void) | null = null
let intervalId: number | null = null

// Function to start watching for changes
const startWatching = () => {
  if (watchStopper) {
    watchStopper()
  }
  
  // Create a computed ref for runners to ensure reactivity
  const simulatedRunners = computed(() => {
    // Return runners for all races to show data
    // For live/running races, this will show the locked data
    return getSimulatedRunners(props.raceId)
  })
  
  // Use a flag to prevent recursive updates
  let isUpdating = false
  
  watchStopper = watch(
    simulatedRunners,
    (newRunners, oldRunners) => {
      // Prevent recursive updates
      if (isUpdating) return
      isUpdating = true
      
      if (Array.isArray(newRunners) && newRunners.length > 0) {
        updateOddsHistory()
      }
      
      // Reset the flag after a short delay to allow future updates
      setTimeout(() => {
        isUpdating = false
      }, 100)
    },
    { deep: true, immediate: true }
  )
  
  // Also watch updateCounter for force updates
  watch(updateCounter, () => {
    // Prevent recursive updates
    if (isUpdating) return
    isUpdating = true
    
    // ONLY update for upcoming races (countdown status)
    const raceElement = document.querySelector(`[data-race-id="${props.raceId}"]`);
    let isRaceCountdown = false;
    if (raceElement) {
      const raceStatus = raceElement.getAttribute('data-race-status');
      // Update for countdown races (upcoming races)
      isRaceCountdown = raceStatus === 'countdown';
    }
    
    // Update only for countdown races to show live odds updates
    // For live/running races, show locked data
    if (isRaceCountdown) {
      const runners = getSimulatedRunners(props.raceId)
      if (Array.isArray(runners) && runners.length > 0) {
        updateOddsHistory()
      }
    }
    
    // Reset the flag after a short delay to allow future updates
    setTimeout(() => {
      isUpdating = false
    }, 100)
  }, { immediate: true })
}

onMounted(() => {
  // OddsTrendChart mounted for race
  // showChart.value:
  
  if (showChart.value) {
    // Initialize history
    initializeOddsHistory()
    
    // Start watching for changes
    startWatching()
    
    // Periodic update to ensure chart refreshes
    // Update chart for countdown races only
    // Changed from 1000ms to 5000ms to match odds update timing
    intervalId = window.setInterval(() => {
      if (showChart.value) {
        // Check if race is in countdown status before updating
        const raceElement = document.querySelector(`[data-race-id="${props.raceId}"]`);
        if (raceElement) {
          const raceStatus = raceElement.getAttribute('data-race-status');
          const isRaceCountdown = raceStatus === 'countdown';
          
          // Only update chart for countdown races
          if (isRaceCountdown) {
            // Use a flag to prevent recursive updates
            if (!isUpdatingChart.value) {
              isUpdatingChart.value = true
              updateCounter.value++
              setTimeout(() => {
                isUpdatingChart.value = false
              }, 100)
            }
          }
        }
      }
    }, 5000) // Update every 5 seconds to match odds update timing
  }
  
  // Listen for simulation initialization
  const handleSimulationInitialized = (event: Event) => {
    const customEvent = event as CustomEvent<{ raceId: string }>;
    if (customEvent.detail.raceId === props.raceId) {
      // Simulation initialized for race
      if (showChart.value) {
        initializeOddsHistory();
        startWatching();
        loaded.value = true;
      }
    }
  };
  
  window.addEventListener('simulation-initialized', handleSimulationInitialized);
  
  // Clean up listener
  onUnmounted(() => {
    window.removeEventListener('simulation-initialized', handleSimulationInitialized);
  });
})

// Clean up watcher and interval
onUnmounted(() => {
  // OddsTrendChart unmounted for race
  
  if (watchStopper) {
    watchStopper()
  }
  if (intervalId) {
    clearInterval(intervalId)
  }
})

// Watch for simulation mode changes
watch(showChart, (newVal, oldVal) => {
  // showChart changed for race from oldVal to newVal
  
  if (newVal && !oldVal) {
    // Enable chart
    // Enabling chart for race
    initializeOddsHistory()
    startWatching()
    loaded.value = true // Make sure loaded is set to true when chart is enabled
  } else if (!newVal && oldVal) {
    // Disable chart
    // Disabling chart for race
    if (watchStopper) {
      watchStopper()
      watchStopper = null
    }
    loaded.value = false
  }
}, { immediate: true })

const chartData = computed(() => {
  // Computing chart data for race
  // loaded.value:
  // showChart.value:
  // oddsHistory.value:
  
  if (!loaded.value || !showChart.value) {
    return {
      labels: [],
      datasets: []
    }
  }
  
  // Check race status to determine if we should show live data or locked data
  const raceElement = document.querySelector(`[data-race-id="${props.raceId}"]`);
  let isRaceCountdown = false;
  let isRaceStartingSoon = false;
  if (raceElement) {
    const raceStatus = raceElement.getAttribute('data-race-status');
    isRaceCountdown = raceStatus === 'countdown';
    isRaceStartingSoon = raceStatus === 'starting_soon';
  }
  
  // Get fresh runners data to ensure reactivity
  const allRunners = getSimulatedRunners(props.raceId)
  
  // For starting soon races, show locked data with no trend indicators
  if (isRaceStartingSoon) {
    // Filter to show all runners but with no trend (locked odds)
    const runners = allRunners.map((runner) => ({
      ...runner,
      oddsTrend: 'none' // Lock the trend for starting soon races
    }));
    // Runners with locked trends for starting soon race:
    
    if (runners.length === 0) {
      return {
        labels: [],
        datasets: []
      }
    }
    
    // Create time labels (last 10 points)
    const timeLabels: string[] = []
    const sampleRunnerId = runners[0].id
    
    if (oddsHistory.value[sampleRunnerId] && oddsHistory.value[sampleRunnerId].length > 0) {
      const dataPoints = oddsHistory.value[sampleRunnerId]
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
    
    // Time labels:
    
    // Create datasets for each runner with locked odds
    const datasets = runners.map((runner, index) => {
      const colors = [
        'rgb(249, 115, 22)', // brand-primary (orange)
        'rgb(15, 23, 42)',   // brand-secondary (dark blue)
        'rgb(250, 204, 21)', // brand-accent (yellow)
        'rgb(22, 163, 74)',  // success (green)
        'rgb(124, 58, 237)', // violet
        'rgb(219, 39, 119)'  // pink
      ]
      
      const backgroundColors = [
        'rgba(249, 115, 22, 0.1)',
        'rgba(15, 23, 42, 0.1)',
        'rgba(250, 204, 21, 0.1)',
        'rgba(22, 163, 74, 0.1)',
        'rgba(124, 58, 237, 0.1)',
        'rgba(219, 39, 119, 0.1)'
      ]
      
      // Create data points for this runner
      const dataPoints = oddsHistory.value[runner.id] || []
      const data = dataPoints.map(point => point.odds)
      
      return {
        label: `${runner.number}. ${runner.name}`,
        data,
        borderColor: colors[index % colors.length],
        backgroundColor: backgroundColors[index % backgroundColors.length],
        fill: true,
        tension: 0.4,
        pointRadius: isRaceCountdown ? 3 : 0, // Show points only during countdown
        pointHoverRadius: 5
      }
    })
    
    return {
      labels: timeLabels,
      datasets
    }
  }
  
  // For countdown races, show live updating data
  if (isRaceCountdown) {
    // Filter to show only runners with valid odds
    const runners = allRunners.filter(runner => 
      typeof runner.odds === 'number' &&
      runner.odds > 0
    );
    // Active runners for countdown race:
    
    if (runners.length === 0) {
      return {
        labels: [],
        datasets: []
      }
    }
    
    // Create time labels (last 10 points)
    const timeLabels: string[] = []
    const sampleRunnerId = runners[0].id
    
    if (oddsHistory.value[sampleRunnerId] && oddsHistory.value[sampleRunnerId].length > 0) {
      const dataPoints = oddsHistory.value[sampleRunnerId]
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
    
    // Time labels for countdown race:
    
    // Create datasets for each runner
    const datasets = runners.map((runner, index) => {
      const colors = [
        'rgb(249, 115, 22)', // brand-primary (orange)
        'rgb(15, 23, 42)',   // brand-secondary (dark blue)
        'rgb(250, 204, 21)', // brand-accent (yellow)
        'rgb(22, 163, 74)',  // success (green)
        'rgb(124, 58, 237)', // violet
        'rgb(219, 39, 119)'  // pink
      ]
      
      const backgroundColors = [
        'rgba(249, 115, 22, 0.1)',
        'rgba(15, 23, 42, 0.1)',
        'rgba(250, 204, 21, 0.1)',
        'rgba(22, 163, 74, 0.1)',
        'rgba(124, 58, 237, 0.1)',
        'rgba(219, 39, 119, 0.1)'
      ]
      
      // Create data points for this runner
      const dataPoints = oddsHistory.value[runner.id] || []
      const data = dataPoints.map(point => point.odds)
      
      // Determine trend color
      let trendColor = colors[index % colors.length]
      if (runner.oddsTrend === 'up') {
        trendColor = 'rgb(22, 163, 74)' // green
      } else if (runner.oddsTrend === 'down') {
        trendColor = 'rgb(220, 38, 38)' // red
      }
      
      return {
        label: `${runner.number}. ${runner.name}`,
        data,
        borderColor: trendColor,
        backgroundColor: backgroundColors[index % backgroundColors.length],
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5
      }
    })
    
    return {
      labels: timeLabels,
      datasets
    }
  }
  
  // For all other race statuses, show locked data (no live updates)
  // This includes 'open', 'starting_soon', 'live', 'finished', etc.
  // Filter to show all runners but with no trend indicators
  const runners = allRunners.map((runner) => ({
    ...runner,
    oddsTrend: 'none' // Lock the trend for non-countdown races
  }));
  // Runners with locked trends for non-countdown race:
  
  if (runners.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }
  
  // Create time labels (last 10 points)
  const timeLabels: string[] = []
  const sampleRunnerId = runners[0].id
  
  if (oddsHistory.value[sampleRunnerId] && oddsHistory.value[sampleRunnerId].length > 0) {
    const dataPoints = oddsHistory.value[sampleRunnerId]
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
  
  // Time labels for locked data:
  
  // Create datasets for each runner with locked odds
  const datasets = runners.map((runner, index) => {
    const colors = [
      'rgb(249, 115, 22)', // brand-primary (orange)
      'rgb(15, 23, 42)',   // brand-secondary (dark blue)
      'rgb(250, 204, 21)', // brand-accent (yellow)
      'rgb(22, 163, 74)',  // success (green)
      'rgb(124, 58, 237)', // violet
      'rgb(219, 39, 119)'  // pink
    ]
    
    const backgroundColors = [
      'rgba(249, 115, 22, 0.1)',
      'rgba(15, 23, 42, 0.1)',
      'rgba(250, 204, 21, 0.1)',
      'rgba(22, 163, 74, 0.1)',
      'rgba(124, 58, 237, 0.1)',
      'rgba(219, 39, 119, 0.1)'
    ]
    
    // Create data points for this runner
    const dataPoints = oddsHistory.value[runner.id] || []
    const data = dataPoints.map(point => point.odds)
    
    return {
      label: `${runner.number}. ${runner.name}`,
      data,
      borderColor: colors[index % colors.length],
      backgroundColor: backgroundColors[index % backgroundColors.length],
      fill: true,
      tension: 0.4,
      pointRadius: 0, // Hide points for locked data
      pointHoverRadius: 0
    }
  })
  
  return {
    labels: timeLabels,
    datasets
  }
})

// Chart options
const chartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          maxRotation: 0,
          autoSkip: false
        }
      },
      y: {
        min: 1,
        max: 20,
        reverse: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value: number | string) {
            if (typeof value === 'number') {
              return value.toFixed(2) + 'x';
            }
            return value;
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2) + 'x';
            }
            return label;
          }
        }
      }
    }
  } as ChartOptions<'line'>
})
</script>

<style scoped>
/* Chart.js canvas styles */
canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>