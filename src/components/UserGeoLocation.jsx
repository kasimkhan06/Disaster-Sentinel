// src/hooks/UserGeoLocation.js (Example Path)
import { useState, useEffect } from "react";

/**
 * Custom hook to get the user's current geolocation.
 * @returns {object} An object containing loading state, error state, and coordinates.
 */
const UserGeoLocation = () => {
    const [location, setLocation] = useState({
        loaded: false,
        coordinates: { lat: "", lng: "" },
        error: null,
    });

    // Handler for successful location retrieval
    const onSuccess = (location) => {
        setLocation({
            loaded: true,
            coordinates: {
                lat: location.coords.latitude,
                lng: location.coords.longitude,
            },
            error: null,
        });
    };

    // Handler for errors during location retrieval
    const onError = (error) => {
        setLocation({
            loaded: true,
            coordinates: { lat: "", lng: "" }, // Reset coordinates on error
            error: {
                code: error.code,
                message: error.message,
            },
        });
         console.error("Geolocation Error:", error.message); // Log error
    };

    useEffect(() => {
        // Check if geolocation is supported by the browser
        if (!("geolocation" in navigator)) {
            onError({
                code: 0,
                message: "Geolocation not supported",
            });
            return;
        }

        // Request the current position
        // High accuracy might take longer and use more power
        navigator.geolocation.getCurrentPosition(onSuccess, onError, {
             enableHighAccuracy: false, // Set to true for more accuracy if needed
             timeout: 10000, // Time (ms) before erroring out
             maximumAge: 0 // Don't use a cached position
        });

        // Note: No cleanup needed for getCurrentPosition,
        // but watchPosition would require navigator.geolocation.clearWatch()

    }, []); // Empty dependency array ensures this runs only once on mount

    return location;
};

export default UserGeoLocation;
