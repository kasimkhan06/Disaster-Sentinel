import { useState, useEffect } from "react";
import fetchWeatherData from "./fetchWeatherData";

const useDisasterData = (selectedLocation, setWeather) => {
  const [disasters, setDisasters] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [filteredDisasters, setFilteredDisasters] = useState([]);

  // Fetch past disaster data
  useEffect(() => {
    setLoadingOptions(true);
    fetch(
      "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/past-disasters/?ordering=-year"
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setDisasters(data);
        const uniqueLocations = [...new Set(data.map((d) => d.state))];
        setLocations(uniqueLocations);
        setLoadingOptions(false);
      })
      .catch((error) => console.error("Error fetching disaster data:", error));
  }, []);

  // Filter disasters and fetch weather when location changes
  useEffect(() => {
    if (selectedLocation) {
      setLoading(true);
      const filtered = disasters.filter(
        (d) => d.state.toLowerCase() === selectedLocation.toLowerCase()
      );
      setFilteredDisasters(filtered);
      fetchWeatherData(selectedLocation, setWeather);
      setLoadingWeather(false);
      setLoading(false);
    } else {
      setFilteredDisasters([]);
    }
  }, [selectedLocation, disasters, setWeather]);

  return {
    disasters,
    locations,
    filteredDisasters,
    setFilteredDisasters,
    loading,
    loadingOptions,
    loadingWeather,
  };
};

export default useDisasterData;
