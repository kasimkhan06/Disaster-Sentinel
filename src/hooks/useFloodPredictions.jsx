import { useState, useEffect } from "react";

// useFloodPredictions.js
const useFloodPredictions = (stationData) => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Default static data with valid coordinates
  const getStaticPrediction = () => ({
    latitude: 28.6139,  // New Delhi
    longitude: 77.2090,
    probability: 0.002267350209876895,
    prediction: 0,
    threshold: 0.8972452878952026,
    riskLevel: 'low',
    stationId: 'static-india-1'
  });

  useEffect(() => {
    if (!stationData || stationData.length === 0) {
      setPredictions([getStaticPrediction()]);
      return;
    }

    const fetchPredictions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch("https://your-flood-prediction-api.com/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(stationData),
        });

        if (!response.ok) throw new Error("Failed to fetch flood predictions");

        const data = await response.json();
        const validPredictions = data.predictions?.filter(p => 
          p.latitude && p.longitude
        ) || [getStaticPrediction()];
        
        setPredictions(validPredictions);
      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
        setPredictions([getStaticPrediction()]);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [stationData]);

  return { predictions, loading, error };
};

export default useFloodPredictions;