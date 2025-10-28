const { generateRandomizedRunners } = require('./src/composables/useOddsSimulation.ts');

// Category IDs from test-category-ids.js
const CATEGORY_IDS = {
  HORSE: '4a2788f8-e825-4d36-9894-efd4baf1cfae',
  GREYHOUND: '9daef0d7-bf3c-4f50-921d-8e818c60fe61',
  HARNESS: '161d9be2-e909-4326-8c2c-35ed71fb460b'
}

// Generate runners for horse race
const horseRunners = generateRandomizedRunners('debug-race-1', CATEGORY_IDS.HORSE);
console.log('Horse runners:');
horseRunners.forEach((runner, index) => {
  console.log(`  ${index + 1}. ${runner.name} - ${runner.jockey}`);
});

// Generate runners for greyhound race
const greyhoundRunners = generateRandomizedRunners('debug-race-2', CATEGORY_IDS.GREYHOUND);
console.log('\nGreyhound runners:');
greyhoundRunners.forEach((runner, index) => {
  console.log(`  ${index + 1}. ${runner.name} - ${runner.jockey}`);
});

// Generate runners for harness race
const harnessRunners = generateRandomizedRunners('debug-race-3', CATEGORY_IDS.HARNESS);
console.log('\nHarness runners:');
harnessRunners.forEach((runner, index) => {
  console.log(`  ${index + 1}. ${runner.name} - ${runner.jockey}`);
});