// Test to verify category IDs are correct
const CATEGORY_IDS = {
  HORSE: '4a2788f8-e825-4d36-9894-efd4baf1cfae',
  GREYHOUND: '9daef0d7-bf3c-4f50-921d-8e818c60fe61',
  HARNESS: '161d9be2-e909-4326-8c2c-35ed71fb460b'
};

console.log('Horse ID:', CATEGORY_IDS.HORSE);
console.log('Greyhound ID:', CATEGORY_IDS.GREYHOUND);
console.log('Harness ID:', CATEGORY_IDS.HARNESS);

// Test a sample race object
const sampleRace = {
  id: 'test-race-1',
  meeting_name: 'Test Meeting',
  race_number: 1,
  advertised_start_ms: Date.now() + 300000, // 5 minutes from now
  category_id: CATEGORY_IDS.HORSE
};

console.log('Sample race category ID:', sampleRace.category_id);
console.log('Is horse race:', sampleRace.category_id === CATEGORY_IDS.HORSE);
console.log('Is greyhound race:', sampleRace.category_id === CATEGORY_IDS.GREYHOUND);
console.log('Is harness race:', sampleRace.category_id === CATEGORY_IDS.HARNESS);