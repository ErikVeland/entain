<template>
  <div v-if="showChart && loaded" class="h-64 w-full">
    <Line 
      :data="chartData" 
      :options="chartOptions"
      ref="chartRef"
    />
  </div>
  <div v-else-if="showChart" class="h-64 w-full flex items-center justify-center">
    <div class="text-text-muted">Loading chart data...</div>
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


// Only show chart in simulation mode
const showChart = computed(() => {
  return betsStore.showGame && betsStore.useSimulatedData
})

const timeRange = ref<'5m' | '15m' | '30m'>('15m')
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
  
  watchStopper = watch(
    simulatedRunners,
    (newRunners, oldRunners) => {
      if (Array.isArray(newRunners) && newRunners.length > 0) {
        updateOddsHistory()
      }
    },
    { deep: true, immediate: true }
  )
  
  // Also watch updateCounter for force updates
  watch(updateCounter, () => {
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
    
    // Periodic update to ensure chart refreshes (reduced from 500ms to 1000ms for better performance)
    // Update chart for countdown races only
    intervalId = window.setInterval(() => {
      if (showChart.value) {
        // Check if race is in countdown status before updating
        const raceElement = document.querySelector(`[data-race-id="${props.raceId}"]`);
        if (raceElement) {
          const raceStatus = raceElement.getAttribute('data-race-status');
          const isRaceCountdown = raceStatus === 'countdown';
          
          // Only update chart for countdown races
          if (isRaceCountdown) {
            updateCounter.value++
          }
        }
      }
    }, 1000)
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
      
      // Get odds history for this runner
      const history = oddsHistory.value[runner.id] || []
      const oddsData = history.map(point => point.odds)
      
      // Runner history:
      // Runner odds data:
      
      return {
        label: `${runner.number}. ${runner.name}`,
        data: oddsData,
        borderColor: colors[index % colors.length],
        backgroundColor: backgroundColors[index % backgroundColors.length],
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: colors[index % colors.length],
        fill: false,
        tension: 0.4 // Smooth curves
      }
    })
    
    // Chart datasets for starting soon race:
    
    return {
      labels: timeLabels,
      datasets
    }
  }
  
  // For countdown and starting_soon races, show runners with significant odds changes
  // For countdown races, filter to only show runners with significant odds changes (trend is not 'none')
  // For starting_soon races, show all runners but with locked odds (trend is 'none')
  const runners = isRaceCountdown ? 
    allRunners.filter((runner) => runner.oddsTrend !== 'none') : 
    allRunners.map((runner) => ({ ...runner, oddsTrend: 'none' }))
  // All runners:
  // Runners with significant changes for chart:
  
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
    
    // Get odds history for this runner
    const history = oddsHistory.value[runner.id] || []
    const oddsData = history.map(point => point.odds)
    
    // Runner history:
    // Runner odds data:
    
    return {
      label: `${runner.number}. ${runner.name}`,
      data: oddsData,
      borderColor: colors[index % colors.length],
      backgroundColor: backgroundColors[index % backgroundColors.length],
      borderWidth: 2,
      pointRadius: 3,
      pointBackgroundColor: colors[index % colors.length],
      fill: false,
      tension: 0.4 // Smooth curves
    }
  })
  
  // If no runners with significant changes, show a message
  if (datasets.length === 0 && allRunners.length > 0) {
    return {
      labels: ['No significant changes'],
      datasets: [{
        label: 'No significant odds movements',
        data: [0],
        borderColor: 'rgba(148, 163, 184, 0.5)',
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
        borderWidth: 1,
        pointRadius: 0,
        fill: false
      }]
    }
  }
  
  // Chart datasets:
  
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
        padding: 20,
        textAlign: 'left' as const
      },
      position: 'bottom' as const,
      align: 'start' as const
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
