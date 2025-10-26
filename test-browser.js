// Test to check if races are being fetched and displayed
async function testRaces() {
  try {
    // Wait a bit for the app to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if the races store has data
    const response = await fetch('http://localhost:5180/src/stores/races.ts');
    const racesModule = await response.text();
    console.log('Races module loaded');
    
    // Try to fetch races directly
    const apiResponse = await fetch('https://api.neds.com.au/rest/v1/racing/?method=nextraces&count=10');
    const data = await apiResponse.json();
    console.log('API Data:', data);
    
    if (data && data.data && data.data.next_to_go_ids) {
      console.log('Successfully fetched', data.data.next_to_go_ids.length, 'races');
    }
  } catch (error) {
    console.error('Error in test:', error);
  }
}

testRaces();