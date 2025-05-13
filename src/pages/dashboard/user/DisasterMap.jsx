import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const getEventIcon = (eventType) => {
  const iconUrl = eventType === 'Earthquake' 
    ? 'https://cdn-icons-png.flaticon.com/512/2776/2776067.png'
    : eventType === 'Tropical Cyclone'
    ? 'https://cdn-icons-png.flaticon.com/512/414/414927.png'
    : 'https://cdn-icons-png.flaticon.com/512/484/484167.png';
  
  return new L.Icon({
    iconUrl,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const DisasterMap = ({ coordinates, eventType }) => {
  if (!coordinates) return null;

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
      center={[coordinates.lat, coordinates.lon]}
      zoom={6}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution=''
      />
      <Marker position={[coordinates.lat, coordinates.lon]} icon={getEventIcon(eventType)}>
        <Popup>
          {eventType} Event<br />
          Latitude: {coordinates.lat.toFixed(2)}<br />
          Longitude: {coordinates.lon.toFixed(2)}
        </Popup>
      </Marker>
      <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
            background: `
              linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 10%),
              linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 10%),
              linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 10%),
              linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 10%)
            `,
            zIndex: 1000, // Higher than map elements
            borderRadius: "12px",
          }}
        />
    </MapContainer>
  
    </div>
  );
};

export default DisasterMap;