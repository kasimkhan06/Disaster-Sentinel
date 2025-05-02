// src/utils/ReverseGeocode.js (Example Path)

/**
 * Performs reverse geocoding using Nominatim API to find an address/place name for given coordinates.
 * @param {number} lat - Latitude.
 * @param {number} lng - Longitude.
 * @returns {Promise<string>} A promise that resolves with the display name or an error message.
 */
export const reverseGeocode = async (lat, lng) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.display_name) {
            return data.display_name; // Return the full address/place name
        } else if (data && data.error) {
             console.error("Reverse geocoding error from API:", data.error);
            return `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`; // Fallback
        }
         else {
            console.warn("Reverse geocoding returned no display name for:", lat, lng);
            return `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`; // Fallback
        }
    } catch (error) {
        console.error("Reverse geocoding request failed:", error);
        return `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`; // Fallback on fetch error
    }
};
