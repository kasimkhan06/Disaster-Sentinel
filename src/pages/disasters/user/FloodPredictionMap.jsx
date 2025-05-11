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

const FloodPredictionMap = ({
  stations,
  selectedLocation,
  currentLocationCoords,
  focusOnCurrentLocation,
  onLocationFocused,
  showNoStationsMessage,
  currentLocationState,
  isMobile,
}) => {
  const [mapCenter, setMapCenter] = useState([0, 0]);
  const [zoomLevel, setZoomLevel] = useState(3); // Start with a lower zoom level
  const mapRef = useRef(null);
  const [noStationsPopup, setNoStationsPopup] = useState(null);
  const navigate = useNavigate();
  const currentLocationMarkerRef = useRef(null);

  const safeIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: isMobile? [14, 24] : [20, 35],
    iconAnchor: isMobile? [10, 39] : [12, 41],
    popupAnchor: isMobile? [0, -28] : [1, -34],
    shadowSize: isMobile? [0, 0] : [30, 30],
  });
  
  const cautionIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: isMobile? [14, 24] : [20, 35],
      iconAnchor: isMobile? [10, 39] : [12, 41],
      popupAnchor: isMobile? [0, -28] : [1, -34],
      shadowSize: isMobile? [0, 0] : [30, 30],
  });

  //fit all markers in the map view
  const FitBounds = ({ markers, isMobile }) => {
    const map = useMap();
  
    useEffect(() => {
      if (markers.length > 0) {
        const bounds = L.latLngBounds(markers);
        
        // First fit bounds without padding to get tight view
        map.fitBounds(bounds, { 
          padding: [20, 20], // Base padding
          maxZoom: 12
        });
  
        // Then apply mobile-specific adjustment
        if (isMobile) {
          // Calculate pixel offset (25% of map height)
          const offsetPixels = map.getSize().y * 0.15;
          
          // Convert pixel offset to geographic coordinates
          const point = map.project(map.getCenter());
          const newPoint = point.add([0, -offsetPixels]);
          const newCenter = map.unproject(newPoint);
          
          // Set new view with adjusted center
          map.setView(newCenter, map.getZoom(), { animate: false });
        }
      }
    }, [markers, map, isMobile]);
  
    return null;
  };

  const ChangeView = ({ center, zoom, isMobile }) => {
    const map = useMap();
    useEffect(() => {
      if (center) {
        const constrainedZoom = Math.min(zoom || 12, 12);
        
        // For mobile, pan the view slightly down after setting it
        map.setView(center, constrainedZoom);
        
        if (isMobile) {
          // Pan down by ~10% of the map height
          const offset = map.getSize().y * 0.5;
          map.panBy([0, -offset], { animate: false });
        }
      }
    }, [center, zoom, map, isMobile]);
  
    return null;
  };
  
  const currentLocationIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    // iconSize: [25, 41],
    // iconAnchor: [12, 41],
    // popupAnchor: [1, -34],
    // shadowSize: [41, 41],
    iconSize: isMobile? [14, 24] : [20, 35],
    iconAnchor: isMobile? [10, 39] : [12, 41],
    popupAnchor: isMobile? [0, -28] : [1, -34],
    shadowSize: isMobile? [0, 0] : [30, 30],
  });

  // Extract marker positions from stations
  const markerPositions = stations.map((station) => [
    station.latitude,
    station.longitude,
  ]);

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
      const marker = L.marker(
        [currentLocationCoords.lat, currentLocationCoords.lng],
        {
          icon: currentLocationIcon,
        }
      ).addTo(mapRef.current);

      const popup = L.popup()
        .setLatLng([currentLocationCoords.lat, currentLocationCoords.lng])
        .setContent(
          `
          <div style="padding: 8px; min-width: 200px;">
            <strong>No stations found in ${currentLocationState}</strong>
            <p>There are no monitoring stations in your current state.</p>
          </div>
        `
        )
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
    <div
    style={{
      width: "100%",
      height: "100%",
      // borderRadius: "12px",
      // position: 'relative',
      padding: 0,
    margin: 0,
    // Ensure the container takes full viewport width on mobile
    ...(isMobile && {
      position: "fixed",
      left: 0,
      right: 0
    })
    }}
  >
    <MapContainer
      center={mapCenter}
      zoom={zoomLevel}
      style={{
        height: "100%",
        width: "100%",
        // borderRadius: "12px",
        filter:
            "brightness(0.85) contrast(1.4) saturate(1) hue-rotate(10deg)",
      }}
      whenCreated={(mapInstance) => {
        mapRef.current = mapInstance;
      }}
    >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
        />
        
        {/* Labels layer that only appears when zoomed in */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
          minZoom={5} // Only show labels when zoomed in to level 10 or higher
        />

<ChangeView center={mapCenter} zoom={zoomLevel} isMobile={isMobile} />

        {stations.map((station, index) => (
          <Marker
            key={index}
            position={[station.latitude, station.longitude]}
            icon={station.reliability === "Safe" ? safeIcon : cautionIcon}
          >
            <Popup>
              <strong>{station.station}</strong>
              <ul>
                <li>Station Name: {station.station_name}</li>
                <li>
                  Danger Level: {parseFloat(station.danger_level).toFixed(2)}
                </li>
                <li>
                  Warning Level: {parseFloat(station.warning_level).toFixed(2)}
                </li>
              </ul>
              <button
                onClick={() => handlePredictFlood(station.gaugeid)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#1976d2",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                  width: "100%",
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

<FitBounds markers={markerPositions} isMobile={isMobile} />
      </MapContainer>

      {/* Gradient overlay */}
      {/* <div
  style={{
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    background: `
      linear-gradient(to top, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 3%),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 3%),
      linear-gradient(to left, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 3%),
      linear-gradient(to right, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 3%)
    `,
    zIndex: 1000, // Increased z-index to ensure it's above the map
    borderRadius: "12px",
  }}
/> */}
    </div>
  );
};

export default FloodPredictionMap;
