import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Set default marker icon options
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DisasterMap = ({ disaster }) => {
  if (!disaster || !disaster.latitude || !disaster.longitude) {
    return <p>Location data not available.</p>;
  }

  const position = [disaster.latitude, disaster.longitude];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "400px",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "100%", width: "100%", position: "absolute", zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>{disaster.title || "Disaster Location"}</Popup>
        </Marker>
      </MapContainer>

      {/* Fading Overlay on All Sides */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none", // Ensure the overlay doesn't block map interactions
          background: `
            linear-gradient(to top, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0) 20%),
            linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 20%),
            linear-gradient(to left, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 20%),
            linear-gradient(to right, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 20%)
          `,
          zIndex: 2, // Ensure the overlay is above the map
        }}
      />
    </div>
  );
};

export default DisasterMap;