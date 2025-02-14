import React from "react";
import { useState, useEffect } from "react";

const useDisasterSummary = (disaster) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!disaster) return;
    let isMounted = true;
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/disaster-summary/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            disaster_date: disaster.year, // Adjust as needed
            month_occurred: disaster.month,
            // month_occurred: new Date(disaster.year, 0).toLocaleString("default", { month: "long" }),
            disaster_location: disaster.location,
            disaster_type: disaster.disaster_type,
            total_deaths: disaster.total_deaths,
            total_injured: disaster.total_injured,
            total_affected: disaster.total_affected,
          }),
        });

        const data = await response.json();
        setSummary(data.summary || "No summary available.");
        setLoading(false);
        // console.log("In getDisasterSummary:"+loading);
        console.log(data);
      } catch (err) {
        setError("Failed to fetch disaster summary.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [disaster]);

  useEffect(() => {
    console.log("Updated loading state:", loading);
  }, [loading]);

  return { summary, loading, error };
};

export default useDisasterSummary;
