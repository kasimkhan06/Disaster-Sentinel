import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { Link } from "react-router-dom";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom icons for different reliability levels
const safeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [20, 35],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [39, 39]
});

const cautionIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [20, 35],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [39, 39]
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

const FloodPredictionMap = ({ stations }) => {
  // Extract marker positions from stations
  const markerPositions = stations.map(station => [station.latitude, station.longitude]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: "12px",
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
        {stations.map((station, index) => (
          <Marker 
            key={index} 
            position={[station.latitude, station.longitude]}
            icon={station.reliability === 'Safe' ? safeIcon : cautionIcon} // Conditional icon based on reliability
          >
            <Popup>
              <strong>{station.station}</strong>
              <ul>
                <li>Danger Level: {parseFloat(station.danger_level).toFixed(2)}</li>
                <li>Warning Level: {parseFloat(station.warning_level).toFixed(2)}</li>
                {/* Add more station details here if needed */}
              </ul>
            </Popup>
          </Marker>
        ))}
        <FitBounds markers={markerPositions} />
      </MapContainer>
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
    </div>
  );
};

export default FloodPredictionMap;