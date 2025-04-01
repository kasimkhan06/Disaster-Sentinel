import { useState, useEffect } from "react";

const fetchStationData = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stateNames, setStateNames] = useState([]); // For unique state names
  const [riverBasins, setRiverBasins] = useState([]); // For unique river basin names

  useEffect(() => {
    fetch("https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/stations/")
      .then((response) => response.json())
      .then((data) => {
        setStations(data);
        // Extract unique state names
        console.log(data);
        const uniqueStateNames = [...new Set(data.map((station) => station.state))];
        setStateNames(uniqueStateNames);
        // Extract unique river basin names
        const uniqueRiverBasins = [...new Set(data.map((station) => station.river_basin))];
        setRiverBasins(uniqueRiverBasins);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching station data:", error);
        setError(error);
        setLoading(false);
      });
  }, []);

  return {
    stations,
    loading,
    error,
    stateNames,
    riverBasins, // Return riverBasins
  };
};

export default fetchStationData;