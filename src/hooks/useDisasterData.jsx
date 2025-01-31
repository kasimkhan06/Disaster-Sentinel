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
      "https://disaster-sentinel-64565e2d120b.herokuapp.com/api/past-disasters/"
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data.results);
        setDisasters(data.results);
        const uniqueLocations = [...new Set(data.results.map((d) => d.State))];
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
        (d) => d.State.toLowerCase() === selectedLocation.toLowerCase()
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
    loading,
    loadingOptions,
    loadingWeather,
  };
};

export default useDisasterData;
