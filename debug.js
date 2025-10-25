// Simple debug script to check if the app is working
console.log('Debug script running');

// Check if Vue is available
try {
  console.log('Vue version:', Vue.version);
} catch (e) {
  console.log('Vue not available:', e.message);
}

// Check if Pinia is available
try {
  console.log('Pinia available');
} catch (e) {
  console.log('Pinia not available:', e.message);
}

// Check if the app element exists
const appElement = document.getElementById('app');
console.log('App element exists:', !!appElement);

if (appElement) {
  console.log('App element content:', appElement.innerHTML);
}