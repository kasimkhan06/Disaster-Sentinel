const fetchWeatherData = async (location, setWeather) => {
  try {
    // First try to get coordinates from Nominatim
    const nominatimResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`,
      {
        headers: {
          'User-Agent': 'YourAppName/1.0 (your@email.com)' // Required by Nominatim usage policy
        }
      }
    );
    
    if (!nominatimResponse.ok) {
      throw new Error(`Nominatim API error: ${nominatimResponse.status}`);
    }

    const nominatimData = await nominatimResponse.json();
    
    if (!nominatimData || nominatimData.length === 0) {
      throw new Error('Location not found');
    }

    const { lat, lon } = nominatimData[0];
    
    // Then fetch weather data
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m`
    );
    
    if (!weatherResponse.ok) {
      throw new Error(`Weather API error: ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();
    
    if (weatherData.current) {
      setWeather({
        temperature_2m: weatherData.current.temperature_2m,
        relative_humidity_2m: weatherData.current.relative_humidity_2m,
        precipitation: weatherData.current.precipitation,
        wind_speed_10m: weatherData.current.wind_speed_10m
      });
    } else {
      throw new Error('No current weather data available');
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Set some default or error state
    setWeather(null);
    // You might want to show this error to the user
    return { error: error.message };
  }
};

export default fetchWeatherData;