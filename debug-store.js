// Simple Node.js script to test race store functionality
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useRacesStore } from './src/stores/races.ts'

// Create a simple Vue app with Pinia
const app = createApp({})
const pinia = createPinia()
app.use(pinia)

// Get the races store
const store = useRacesStore()

console.log('Testing race store functionality...')

// Test fetchRaces
store.fetchRaces().then(() => {
  console.log('Fetch completed')
  console.log('Store state:', store.$state)
  console.log('Races count:', store.races.length)
  console.log('Next five races:', store.nextFive)
  console.log('Load state:', store.loadState)
}).catch(error => {
  console.error('Error fetching races:', error)
})