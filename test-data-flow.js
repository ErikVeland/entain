// Test the data flow from API to UI
async function testDataFlow() {
  try {
    // Fetch data from API
    console.log('Fetching data from Neds API...');
    const response = await fetch('https://api.neds.com.au/rest/v1/racing/?method=nextraces&count=10');
    
    if (!response.ok) {
      console.error('Failed to fetch data:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    console.log('API Response:', data.status);
    
    if (data.status !== 200 || !data.data) {
      console.error('Unexpected API response:', data);
      return;
    }
    
    // Process data like the store does
    console.log('Processing data...');
    const items = data.data.next_to_go_ids
      .map(id => data.data.race_summaries[id])
      .filter(Boolean)
      .map(raw => {
        const secs = typeof raw.advertised_start?.seconds === 'string'
          ? parseInt(raw.advertised_start.seconds, 10)
          : Number(raw.advertised_start?.seconds ?? 0);
          
        return {
          id: raw.race_id,
          meeting_name: raw.meeting_name,
          race_number: typeof raw.race_number === 'string' ? parseInt(raw.race_number, 10) : Number(raw.race_number),
          advertised_start_ms: secs * 1000,
          category_id: raw.category_id
        };
      });
    
    console.log('Processed items:', items.slice(0, 3));
    
    // Filter out expired races (like the store does)
    const now = Date.now();
    const isExpired = (r) => now >= (r.advertised_start_ms + 60000);
    const activeRaces = items.filter(r => !isExpired(r));
    
    console.log('Active races count:', activeRaces.length);
    
    // Sort by start time
    activeRaces.sort((a, b) => a.advertised_start_ms - b.advertised_start_ms);
    
    console.log('Sorted active races (first 5):');
    activeRaces.slice(0, 5).forEach((race, index) => {
      console.log(`${index + 1}. ${race.meeting_name} R${race.race_number} - ${new Date(race.advertised_start_ms).toISOString()}`);
    });
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testDataFlow();