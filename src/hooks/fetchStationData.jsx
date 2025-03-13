import { useState, useEffect } from "react";

const fetchStationData = (selectedLocation) => {
    const [stations, setStations] = useState([]);
    useEffect(() => {
        // setLoadingOptions(true);
        fetch(
          "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/stations/"
        )
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
            setStations(data);
            // const uniqueLocations = [...new Set(data.map((d) => d.state))];
            // setLocations(uniqueLocations);
            // setLoadingOptions(false);
          })
          .catch((error) => console.error("Error fetching station data:", error));
      }, []);
  return {
    stations,
  };
}

export default fetchStationData;


