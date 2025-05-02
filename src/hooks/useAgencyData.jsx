import { useState, useEffect } from "react";

const useAgencyData = () => {
  const [existingAgencies, setExistingAgencies] = useState([]);
  const [addedAgencies, setAddedAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [states, setStates] = useState([]);

  useEffect(() => {
    const fetchAgencies = async () => {
      setLoading(true);
      try {
        // Fetch both agency types in parallel
        const [existingResponse, addedResponse] = await Promise.all([
          fetch("https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/existing-agencies/"),
          fetch("https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/agency-profiles/")
        ]);

        if (!existingResponse.ok || !addedResponse.ok) {
          throw new Error("Failed to fetch agency data");
        }

        const existingData = await existingResponse.json();
        const addedData = await addedResponse.json();

        // Mark added agencies for identification
        const markedAddedAgencies = addedData.map(agency => ({
          ...agency,
          isAddedAgency: true
        }));

        setExistingAgencies(existingData);
        setAddedAgencies(markedAddedAgencies);
        console.log("Existing Agencies:", existingData);
        console.log("Added Agencies:", markedAddedAgencies);

        // Combine states from both sources
        const allStates = [
          ...new Set([
            ...existingData.map(agency => agency.state),
            ...markedAddedAgencies.map(agency => agency.state)
          ])
        ].sort();

        setStates(allStates);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAgencies();
  }, []);

  return { existingAgencies, addedAgencies, states, loading, error };
};

export default useAgencyData;