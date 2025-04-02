import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useNavigate } from "react-router-dom";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom icons for different reliability levels
const safeIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [20, 35],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [39, 39],
});

const cautionIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [20, 35],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [39, 39],
});

const currentLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Fit map to all markers
const FitBounds = ({ markers }) => {
  const map = useMap();

  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, map]);

  return null;
};

const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

const FloodPredictionMap = ({
  stations,
  selectedLocation,
  currentLocationCoords,
  focusOnCurrentLocation,
  onLocationFocused,
  showNoStationsMessage,
  currentLocationState
}) => {
  const [mapCenter, setMapCenter] = useState([0, 0]);
  const [zoomLevel, setZoomLevel] = useState(5);
  const mapRef = useRef(null);
  const [noStationsPopup, setNoStationsPopup] = useState(null);
  const navigate = useNavigate();
  const currentLocationMarkerRef = useRef(null);

  // Extract marker positions from stations
  const markerPositions = stations.map(station => [station.latitude, station.longitude]);

  // Effect to handle location focus changes
  useEffect(() => {
    if (focusOnCurrentLocation && currentLocationCoords) {
      setMapCenter([currentLocationCoords.lat, currentLocationCoords.lng]);
      setZoomLevel(10);
      onLocationFocused();
    }
  }, [focusOnCurrentLocation, currentLocationCoords, onLocationFocused]);

  // Effect to handle no stations message
  useEffect(() => {
    if (showNoStationsMessage && currentLocationCoords && mapRef.current) {
      const marker = L.marker([currentLocationCoords.lat, currentLocationCoords.lng], {
        icon: currentLocationIcon
      }).addTo(mapRef.current);

      const popup = L.popup()
        .setLatLng([currentLocationCoords.lat, currentLocationCoords.lng])
        .setContent(`
          <div style="padding: 8px; min-width: 200px;">
            <strong>No stations found in ${currentLocationState}</strong>
            <p>There are no monitoring stations in your current state.</p>
          </div>
        `)
        .openOn(mapRef.current);

      setNoStationsPopup(popup);

      // Close popup after 5 seconds
      const timer = setTimeout(() => {
        if (mapRef.current && popup) {
          mapRef.current.closePopup(popup);
        }
      }, 5000);

      return () => {
        clearTimeout(timer);
        if (mapRef.current && marker) {
          mapRef.current.removeLayer(marker);
        }
        if (mapRef.current && popup) {
          mapRef.current.closePopup(popup);
        }
      };
    }
  }, [showNoStationsMessage, currentLocationCoords, currentLocationState]);

  const handlePredictFlood = (stationId) => {
    navigate("/", { state: { selectedStation: stationId } });
  };

  return (
    <div style={{
      position: "relative",
      width: "100%",
      height: "100%",
      borderRadius: "12px",
      overflow: "hidden",
    }}>
      <MapContainer
        center={mapCenter}
        zoom={zoomLevel}
        style={{ 
          height: "100%", 
          width: "100%",
          position: "absolute",
          zIndex: 1 
        }}
        whenCreated={mapInstance => { mapRef.current = mapInstance; }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ChangeView center={mapCenter} zoom={zoomLevel} />
        
        {stations.map((station, index) => (
          <Marker 
            key={index} 
            position={[station.latitude, station.longitude]}
            icon={station.reliability === 'Safe' ? safeIcon : cautionIcon}
          >
            <Popup>
              <strong>{station.station}</strong>
              <ul>
                <li>Station Name: {station.station_name}</li>
                <li>Danger Level: {parseFloat(station.danger_level).toFixed(2)}</li>
                <li>Warning Level: {parseFloat(station.warning_level).toFixed(2)}</li>
              </ul>
              <button 
                  onClick={() => handlePredictFlood(station.gaugeid)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    width: '100%'
                  }}
                >
                  Predict Flood
                </button>
            </Popup>
          </Marker>
        ))}
        
        {currentLocationCoords && !showNoStationsMessage && (
          <Marker
            position={[currentLocationCoords.lat, currentLocationCoords.lng]}
            icon={currentLocationIcon}
          >
            <Popup>Your Current Location</Popup>
          </Marker>
        )}
        
        <FitBounds markers={markerPositions} />
      </MapContainer>
      
      {/* Gradient overlay */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        background: `
          linear-gradient(to top, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0) 3%),
          linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 3%),
          linear-gradient(to left, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 3%),
          linear-gradient(to right, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 3%)
        `,
        zIndex: 2,
      }} />
    </div>
  );
};

export default FloodPredictionMap;