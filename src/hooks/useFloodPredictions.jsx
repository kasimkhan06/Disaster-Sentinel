import { useState, useEffect } from "react";

// Default coordinates if not provided by stationData or for initial static display
const DEFAULT_LATITUDE = 12.1822; // New Delhi
const DEFAULT_LONGITUDE = 77.7239;

// useFloodPredictions.js
const useFloodPredictions = (stationData) => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //low risk
  // const floodApiRequestBody = {
  //   'prcp_cum3': 0.0,
  //   'prcp_lag1': 0.0,
  //   'sm_anomaly': -4.35,
  //   'streamflow_lag1': 46.65,
  //   'streamflow_avg3': 46.84,
  //   'doy': 87.0,
  // };

  //medium risk
    // const floodApiRequestBody = {
    //   'prcp_cum3': 6.10,
    //   'prcp_lag1': 0.55,
    //   'sm_anomaly': -2.79,
    //   'streamflow_lag1': 572.80,
    //   'streamflow_avg3': 363.75,
    //   'doy': 183.00
    // };

  //high risk
  const floodApiRequestBody = {
    'prcp_cum3': 10.22,
    'prcp_lag1': 2.11,
    'sm_anomaly': 3.3,
    'streamflow_lag1': 470.64,
    'streamflow_avg3': 467.01,
    'doy': 227.0, 
  };

  useEffect(() => {
    // If stationData is not provided or is empty, set a minimal prediction
    // with default lat/long and null for API-dependent fields.
    // This preserves the original behavior of not fetching if stationData is initially empty.
    if (!stationData || stationData.length === 0) {
      setPredictions([
        {
          latitude: DEFAULT_LATITUDE,
          longitude: DEFAULT_LONGITUDE,
          probability: null, // Data from API not fetched
          prediction: null, // Data from API not fetched
          threshold: null, // Data from API not fetched
          stationId: "initial-static-delhi", // Identifier for this specific static case
        },
      ]);
      setLoading(false); // Ensure loading state is reset
      setError(null); // Ensure error state is reset
      return;
    }

    const fetchPredictions = async () => {
      setLoading(true);
      setError(null);

      // Determine context (lat, long, stationId) from the first element of stationData,
      // or use defaults if not available.
      // Assumes stationData, if provided, is an array of station-like objects.
      const currentStationInfo = stationData[0] || {};
      const contextLatitude =
        currentStationInfo.latitude !== undefined
          ? currentStationInfo.latitude
          : DEFAULT_LATITUDE;
      const contextLongitude =
        currentStationInfo.longitude !== undefined
          ? currentStationInfo.longitude
          : DEFAULT_LONGITUDE;
      const contextStationId =
        currentStationInfo.stationId ||
        `context-station-${String(contextLatitude).replace(".", "_")}-${String(
          contextLongitude
        ).replace(".", "_")}`;

      try {
        const response = await fetch(
          "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/predict/",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(floodApiRequestBody), // Use the fixed request body
          }
        );

        if (!response.ok) {
          let errorMsg = `Failed to fetch flood predictions (HTTP ${response.status})`;
          try {
            // Attempt to parse error response from API, if any
            const errorData = await response.json();
            errorMsg = errorData.message || errorData.detail || errorMsg;
          } catch (parseError) {
            // If error response is not JSON or empty, use the generic HTTP error
            // console.warn("Could not parse error response from API:", parseError);
          }
          throw new Error(errorMsg);
        }

        // API is expected to return: {'probability': ..., 'prediction': ..., 'threshold': ...}
        const apiData = await response.json();

        // Construct the new prediction object using data from the API
        // and the contextual latitude, longitude, and stationId.
        const newPrediction = {
          latitude: contextLatitude,
          longitude: contextLongitude,
          stationId: contextStationId,
          probability: apiData.probability,
          prediction: apiData.prediction,
          threshold: apiData.threshold,
          // riskLevel is removed as per modification requirements
        };

        setPredictions([newPrediction]); // API returns data for a single prediction context
      } catch (err) {
        console.error("Error fetching flood predictions:", err.message);
        setError(err.message);
        // On error, provide a prediction object with context lat/long
        // and null for API-derived fields.
        setPredictions([
          {
            latitude: contextLatitude,
            longitude: contextLongitude,
            stationId: contextStationId, // Use the already determined contextStationId
            probability: null,
            prediction: null,
            threshold: null,
            // riskLevel is removed
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [stationData]); // Rerun effect if stationData changes

  return { predictions, loading, error };
};

export default useFloodPredictions;
