// Simple test to check what the races store is returning
const { createPinia, setActivePinia } = require('pinia');

// Create a pinia instance
const pinia = createPinia();
setActivePinia(pinia);

// Import the races store
const { useRacesStore } = require('./src/stores/races.ts');

// Create an instance of the store
const store = useRacesStore();

// Test the store
console.log('Store created:', store);

// Try to fetch races
store.fetchRaces().then(() => {
  console.log('Races fetched:', store.races);
  console.log('Load state:', store.loadState);
  console.log('Next five:', store.nextFive);
}).catch(err => {
  console.error('Error fetching races:', err);
});