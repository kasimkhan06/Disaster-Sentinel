import { useState, useEffect } from "react";

const useAgencyData = () => {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [states, setStates] = useState([]);

  useEffect(() => {
    setLoading(true);
    fetch(
      "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/agency/"
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setAgencies(data);
        const uniqueStates = [...new Set(data.map((agency) => agency.state))];
        setStates(uniqueStates.sort());
        setLoading(false);
        //   setLoadingOptions(false);
      })
      .catch((error) => console.error("Error fetching Agency data:", error));
  }, []);

  return { agencies, states, loading, error };
};

export default useAgencyData;
