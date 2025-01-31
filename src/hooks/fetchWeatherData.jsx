import React from "react";

const fetchWeatherData = async (locations, setWeather) => {
  try {
    console.log("Fetching weather data for:", locations);
    const geocodeResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${locations}`
    );
    const geocodeData = await geocodeResponse.json();
    if (!geocodeData.length) return;
    const { lat, lon } = geocodeData[0];

    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&timezone=auto`
    );
    const weatherData = await weatherResponse.json();
    console.log("Weather data:", weatherData);
    if (weatherData.current) {
      setWeather(weatherData.current);
    } else {
      setWeather(null);
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
    setWeather(null);
  }
};

export default fetchWeatherData;
