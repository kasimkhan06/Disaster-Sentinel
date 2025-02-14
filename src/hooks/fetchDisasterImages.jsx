import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";

// const API_KEY = "fcb8dfe2d1131a75cd5cdd010495f9a5bcd8c2d701362af4170caec0bd8091aa";
const fetchDisasterImages = (disaster) => {
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!disaster) return;
    let isMounted = true;
    const fetchImages = async () => {
      setLoadingImages(true);
      setError(null);

      try {
        const response = await fetch(
          "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/disaster-images/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              disaster_date: String(disaster.year),
              month_occurred: String(disaster.month),
              disaster_location: disaster.location,
              disaster_type: disaster.disaster_type,
              total_deaths: String(disaster.total_deaths),
              total_injured: String(disaster.total_injured),
              total_affected: String(disaster.total_affected),
            }),
          }
        );

        const data = await response.json();
        if (isMounted) {
          // Make sure images is always an array
          let imagesArray = Array.isArray(data) ? data : Object.values(data);
          // If the array is nested (i.e., the first element is an array), flatten it
          if (imagesArray.length > 0 && Array.isArray(imagesArray[0])) {
            imagesArray = imagesArray.flat();
          }
          setImages(imagesArray);
          console.log("Data from fetchImages:", imagesArray);
        }
        setLoadingImages(false);
        // console.log("In getDisasterSummary:"+loading);
        console.log(data);
      } catch (err) {
        if (isMounted) {
          setError("Failed to fetch disaster images.");
        }
      } finally {
        if (isMounted) {
          setLoadingImages(false);
        }
      }
    };

    fetchImages();
  }, [disaster]);

  useEffect(() => {
    console.log("Updated Image loading state:", loadingImages);
  }, [loadingImages]);

  return { images, loadingImages, error };
};

export default fetchDisasterImages;
