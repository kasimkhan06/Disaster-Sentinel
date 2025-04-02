export const getCurrentLocationState = async () => {
    if (!navigator.geolocation) {
      throw new Error("Geolocation is not supported by your browser");
    }
  
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=10&addressdetails=1`
            );
            const data = await response.json();
            const state = data.address?.state || data.address?.region || data.address?.county;
            resolve(state || "Unknown");
          } catch (err) {
            reject("Could not determine your location");
          }
        },
        (err) => reject(err.message === "User denied Geolocation" 
          ? "Location access denied" 
          : "Error getting location"),
        { timeout: 10000 }
      );
    });
  };