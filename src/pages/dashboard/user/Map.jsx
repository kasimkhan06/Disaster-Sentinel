import React, { useEffect } from "react";
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

const disasterTypeMap = {
  EQ: "Earthquake",
  FL: "Flood",
  WF: "Wildfire",
  TC: "Tropical Cyclone",
  VO: "Volcano",
  DR: "Drought",
  // Add other mappings as needed
};

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

const PopupHandler = ({ selectedDisaster }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedDisaster) {
      const disaster = selectedDisaster;
      const markerLatLng = L.latLng(
        parseFloat(disaster.latitude),
        parseFloat(disaster.longitude)
      );

      // Calculate the needed padding (in pixels) to ensure popup visibility
      const popupPadding = 150; // Adjust this value based on your popup size

      // Get current map bounds and size
      const mapBounds = map.getBounds();
      const mapSize = map.getSize();

      // Convert marker position to container point (pixel coordinates)
      const markerPoint = map.latLngToContainerPoint(markerLatLng);

      // Check if marker is near any edge
      const nearLeft = markerPoint.x < popupPadding;
      const nearRight = markerPoint.x > mapSize.x - popupPadding;
      const nearTop = markerPoint.y < popupPadding;
      const nearBottom = markerPoint.y > mapSize.y - popupPadding;

      // Only pan if marker is near an edge
      if (nearLeft || nearRight || nearTop || nearBottom) {
        // Calculate new center point with offset
        const offsetX = nearLeft ? popupPadding : nearRight ? -popupPadding : 0;
        const offsetY = nearTop ? popupPadding : nearBottom ? -popupPadding : 0;

        const newCenter = map.containerPointToLatLng(
          markerPoint.subtract([offsetX, offsetY])
        );

        // Pan to new position without changing zoom
        map.panTo(newCenter, {
          animate: true,
          duration: 0.5,
        });
      }
    }
  }, [selectedDisaster, map]);

  return null;
};

const Map = ({ disasters, onMarkerClick, selectedDisaster }) => {
  if (!disasters || disasters.length === 0) {
    return (
      <p style={{ padding: "16px", margin: "16px", textAlign: "center" }}>
        No disaster data available.
      </p>
    );
  }

  // Filter out disasters without coordinates
  const validDisasters = disasters.filter(
    (disaster) => disaster.latitude && disaster.longitude
  );

  if (validDisasters.length === 0) {
    return (
      <p style={{ padding: "16px", margin: "16px", textAlign: "center" }}>
        No disasters with valid location data.
      </p>
    );
  }

  // Get marker positions for fitting bounds
  const markerPositions = validDisasters.map((disaster) => [
    parseFloat(disaster.latitude),
    parseFloat(disaster.longitude),
  ]);

  // Function to get appropriate icon based on disaster type and alert level
  const getDisasterIcon = (disaster) => {
    const eventType = disaster.eventtype?.toUpperCase();
    const alertLevel = disaster.alertlevel?.toLowerCase();

    // If we have both eventType and alertLevel, use the dynamic GDACS icon
    if (eventType && alertLevel) {
      return new L.Icon({
        iconUrl: `https://www.gdacs.org/Images/gdacs_icons/alerts/${
          alertLevel.charAt(0).toUpperCase() + alertLevel.slice(1)
        }/${eventType}.png`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });
    }

    // Fallback to colored markers based on disaster type if no alert level
    const type = disaster.eventtype?.toLowerCase();
    if (type && disasterIcons[type]) {
      return disasterIcons[type];
    }

    // Default marker if no specific icon found
    return disasterIcons.default;
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <MapContainer
        center={[20, 0]}
        zoom={1}
        style={{
          height: "100%",
          width: "100%",
          filter:
            "brightness(0.85) contrast(1.4) saturate(0.8) hue-rotate(10deg)",
        }}
      >
        <TileLayer
          attribution=""
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validDisasters.map((disaster) => (
          <Marker
            key={disaster.eventid}
            position={[
              parseFloat(disaster.latitude),
              parseFloat(disaster.longitude),
            ]}
            icon={getDisasterIcon(disaster)}
            eventHandlers={{
              click: () => onMarkerClick(disaster),
            }}
          >
            <Popup
              autoPan={true}
              autoPanPadding={[20, 20]}
              autoPanPaddingTopLeft={[20, 20]}
              autoPanPaddingBottomRight={[20, 20]}
            >
              <div style={{ padding: "8px" }}>
                <strong style={{ display: "block", marginBottom: "4px" }}>
                  {disaster.title}
                </strong>
                <p style={{ margin: "2px 0", fontSize: "13px" }}>
                  Type:{" "}
                  {disasterTypeMap[disaster.eventtype] || disaster.eventtype}
                </p>
                <p style={{ margin: "2px 0", fontSize: "13px" }}>
                  Date: {disaster.pubDate}
                </p>
                <Link
                  to={`/disasters/${disaster.eventid}`}
                  style={{
                    display: "inline-block",
                    marginTop: "6px",
                    fontSize: "13px",
                    color: "#1976d2",
                    textDecoration: "none",
                  }}
                >
                  View Details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}

        <FitBounds markers={markerPositions} />
        <PopupHandler
          markerPositions={markerPositions}
          selectedDisaster={selectedDisaster}
        />
      </MapContainer>
    </div>
  );
};

export default Map;
