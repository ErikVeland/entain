// Copy the normalizeRace function from the store
function normalizeRace(raw) {
  const secs = typeof raw.advertised_start?.seconds === 'string'
    ? parseInt(raw.advertised_start.seconds, 10)
    : Number(raw.advertised_start?.seconds ?? 0)

  return {
    id: raw.race_id,
    meeting_name: raw.meeting_name,
    race_number: typeof raw.race_number === 'string' ? parseInt(raw.race_number, 10) : Number(raw.race_number),
    advertised_start_ms: secs * 1000,
    category_id: raw.category_id
  }
}

// Function to check if a race is expired
function isExpired(r, t) {
  return t >= (r.advertised_start_ms + 60000)
}

async function testApi() {
  try {
    console.log('Fetching data from Neds API...');
    const res = await fetch('https://api.neds.com.au/rest/v1/racing/?method=nextraces&count=10');
    
    if (!res.ok) {
      console.error('Failed to fetch races:', res.status, res.statusText);
      return;
    }
    
    const json = await res.json();
    console.log('API Response Status:', json.status);
    
    if (!json || json.status !== 200 || !json.data) {
      console.error('Unexpected API response format:', json);
      return;
    }
    
    const items = json.data.next_to_go_ids
      .map((id) => json.data.race_summaries[id])
      .filter(Boolean)
      .map(normalizeRace);
    
    console.log('Normalized races (first 3):', items.slice(0, 3));
    
    // Filter out expired races
    const now = Date.now();
    const activeRaces = items.filter(r => !isExpired(r, now));
    
    console.log('Active races count:', activeRaces.length);
    
    // Sort by advertised_start_ms
    activeRaces.sort((a, b) => a.advertised_start_ms - b.advertised_start_ms);
    
    console.log('First 5 sorted active races:');
    activeRaces.slice(0, 5).forEach((race, index) => {
      console.log(`${index + 1}. ${race.meeting_name} R${race.race_number} - ${new Date(race.advertised_start_ms).toISOString()}`);
    });
    
  } catch (err) {
    console.error('Error:', err);
  }
}

testApi();

// Simple test to check if the API is working
fetch('https://api.neds.com.au/rest/v1/racing/?method=nextraces&count=10')
  .then(response => response.json())
  .then(data => {
    console.log('API Response:', data);
    if (data && data.data && data.data.next_to_go_ids) {
      console.log('Number of races:', data.data.next_to_go_ids.length);
      console.log('Race IDs:', data.data.next_to_go_ids);
      // Show details of first race
      if (data.data.next_to_go_ids.length > 0) {
        const firstRaceId = data.data.next_to_go_ids[0];
        console.log('First race details:', data.data.race_summaries[firstRaceId]);
      }
    }
  })
  .catch(error => {
    console.error('Error fetching races:', error);
  });
