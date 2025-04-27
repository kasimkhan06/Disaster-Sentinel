import { useState, useEffect } from "react";

const useDisasterDataHome = () => {
  const [disasters, setDisasters] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [pastDisasters, setPastDisasters] = useState([]);

  // Fetch past disaster data
  useEffect(() => {
    setLoadingOptions(true);
    fetch(
      "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/past-disasters/?ordering=-year"
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched data:", data);
        setDisasters(data);
        const uniqueLocations = [...new Set(data.map((d) => d.state))];
        setLocations(uniqueLocations);
        setLoadingOptions(false);
        setLoading(false);
      })
      .catch((error) => console.error("Error fetching disaster data:", error));
  }, []);

  // Filter disasters by location and last 5 years
  useEffect(() => {
    if (disasters.length > 0) {
      const currentYear = new Date().getFullYear();
      
      // Group disasters by state (location)
      const disastersByLocation = disasters.reduce((acc, disaster) => {
        if (!acc[disaster.state]) {
          acc[disaster.state] = [];
        }
        acc[disaster.state].push(disaster);
        return acc;
      }, {});

      // For each location, filter disasters from last 5 years and take top 5
      const allFilteredDisasters = [];
      Object.keys(disastersByLocation).forEach(location => {
        const locationDisasters = disastersByLocation[location]
          .filter(disaster => disaster.year >= currentYear - 3)
          .sort((a, b) => b.year - a.year) // Sort by year descending
          .slice(0, 5); // Take top 5 most recent
        
        allFilteredDisasters.push(...locationDisasters);
      });

      // Sort all disasters by year descending
      const sortedDisasters = allFilteredDisasters.sort((a, b) => b.year - a.year);

      console.log("Combined and sorted past disasters:", sortedDisasters);
      setPastDisasters(sortedDisasters);
    }
  }, [disasters]);

  return {
    disasters,
    locations,
    loading,
    loadingOptions,
    pastDisasters, // Now a single sorted array
  };
};

export default useDisasterDataHome;