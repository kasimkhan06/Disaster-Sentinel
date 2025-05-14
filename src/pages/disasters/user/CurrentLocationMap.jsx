import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { Link } from "react-router-dom";

// Set default marker icon options
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Fit map to all markers
const FitBounds = ({ markers }) => {
  const map = useMap();

  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers);
      map.fitBounds(bounds, { padding: [50, 50] }); // Adjust padding for better visibility
    }
  }, [markers, map]);

  return null;
};

const CurrentLocationMap = ({ filteredDisasters , isMobile }) => {
  if (!filteredDisasters || filteredDisasters.length === 0) {
    return <p style={{ padding: "16px", margin: "16px", textAlign: "center" }}>Location data not available.</p>;
  }

  // Group disasters by location
  const disasterLocations = filteredDisasters.reduce((acc, disaster) => {
    if (!acc[disaster.location]) {
      acc[disaster.location] = {
        disasters: [],
        latitude: disaster.latitude,
        longitude: disaster.longitude,
      };
    }
    acc[disaster.location].disasters.push({
      title: disaster.title,
      year: disaster.year,
      url: `/disaster-details/${disaster.id}`,
    });
    return acc;
  }, {});
  console.log(disasterLocations);

  // Convert object to an array of location groups
  const groupedDisasters = Object.entries(disasterLocations).map(
    ([location, details]) => ({
      location,
      ...details,
    })
  );

  // Collect marker positions for fitting bounds
  const markerPositions = groupedDisasters.map(({ latitude, longitude }) => [
    latitude,
    longitude,
  ]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "400px",
        borderRadius: isMobile ? 0 : 2,
        overflow: "hidden",
      }}
    >
      <MapContainer
        center={[0, 0]} // Initial center, will be adjusted by FitBounds
        zoom={5} // Default zoom level
        style={{ height: "100%", width: "100%", position: "absolute", zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {groupedDisasters.map(({ location, latitude, longitude, disasters }, index) => (
          <Marker key={index} position={[latitude, longitude]}>
            <Popup>
              <strong>{location}</strong>
              <ul>
                {disasters.map((disaster, idx) => (
                  <li key={idx}>
                    <Link to={disaster.url}>
                      {disaster.title} ({disaster.year})
                    </Link>
                  </li>
                ))}
              </ul>
            </Popup>
          </Marker>
        ))}
        <FitBounds markers={markerPositions} />
      </MapContainer>
      {!isMobile && (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none", // Ensure the overlay doesn't block map interactions
          background: `
            linear-gradient(to top, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0) 3%),
            linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 3%),
            linear-gradient(to left, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 3%),
            linear-gradient(to right, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 3%)
          `,
          zIndex: 2, // Ensure the overlay is above the map
        }}
      />
      )}
    </div>
  );
};

export default CurrentLocationMap;
