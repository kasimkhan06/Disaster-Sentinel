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
      map.fitBounds(bounds, { padding: [10, 10] });
    }
  }, [markers, map]);

  return null;
};

const PopupHandler = ({ selectedDisaster }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedDisaster) {
      const markerLatLng = L.latLng(
        parseFloat(selectedDisaster.latitude),
        parseFloat(selectedDisaster.longitude)
      );

      // Find the marker that matches the selected disaster
      Object.values(map._layers).forEach((layer) => {
        if (
          layer instanceof L.Marker &&
          layer.getLatLng().equals(markerLatLng)
        ) {
          layer.openPopup();
        }
      });
    }
  }, [selectedDisaster, map]);

  return null;
};

// Update the Map component with these changes
const Map = ({
  disasters,
  onMarkerClick,
  selectedDisaster,
  highlightedDisaster,
  isMobile,
}) => {
  const mapRef = useRef(null);

  // useEffect(() => {
  //   if (mapRef.current) {
  //     // Remove the default zoom control if it exists
  //     mapRef.current._zoomControl?.remove();
  //   }
  // }, []);

  // if (!disasters || disasters.length === 0) {
  //   return (
  //     <p style={{ padding: "16px", margin: "16px", textAlign: "center" }}>
  //       No disaster data available.
  //     </p>
  //   );
  // }

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
  const getDisasterIcon = (disaster, isMobile) => {
    const eventType = disaster.eventtype?.toUpperCase();
    const alertLevel = disaster.alertlevel?.toLowerCase();
    
    // Set icon sizes based on device type
    const iconSize = isMobile ? [24, 24] : [32, 32];
    const iconAnchor = isMobile ? [12, 12] : [16, 16];
    const popupAnchor = isMobile ? [0, -12] : [0, -16];

    // If we have both eventType and alertLevel, use the dynamic GDACS icon
    if (eventType && alertLevel) {
      return new L.Icon({
        iconUrl: `https://www.gdacs.org/Images/gdacs_icons/alerts/${
          alertLevel.charAt(0).toUpperCase() + alertLevel.slice(1)
        }/${eventType}.png`,
        iconSize,
        iconAnchor,
        popupAnchor,
      });
    }

    // Fallback to colored markers based on disaster type if no alert level
    const type = disaster.eventtype?.toLowerCase();
    if (type && disasterIcons[type]) {
      // Clone the existing icon and adjust its size for mobile
      const icon = L.icon(disasterIcons[type].options);
      if (isMobile) {
        icon.options.iconSize = iconSize;
        icon.options.iconAnchor = iconAnchor;
        icon.options.popupAnchor = popupAnchor;
      }
      return icon;
    }

    // Default marker if no specific icon found
    const defaultIcon = L.icon(disasterIcons.default.options);
    if (isMobile) {
      defaultIcon.options.iconSize = iconSize;
      defaultIcon.options.iconAnchor = iconAnchor;
      defaultIcon.options.popupAnchor = popupAnchor;
    }
    return defaultIcon;
};

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <MapContainer
        center={[20, 0]}
        zoom={isMobile ? 1 : 2} 
        style={{
          height: "100%",
          width: "100%",
          filter:
            "brightness(0.85) contrast(1.4) saturate(0.8) hue-rotate(10deg)",
        }}
        zoomControl={false}
        ref={mapRef}
        worldCopyJump={true} // Allows horizontal wrapping
        // maxBounds={[
        //   [-90, -180],
        //   [90, 180],
        // ]} // Limits vertical panning
        // maxBoundsViscosity={1.0}
      >
        <TileLayer
          attribution=""
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          noWrap={false}
        />

        {/* Add custom zoom control at bottom-left */}
        <div className="leaflet-bottom leaflet-left">
          <div className="leaflet-control leaflet-bar leaflet-control-zoom">
            <a
              className="leaflet-control-zoom-in"
              href="#"
              title="Zoom in"
              role="button"
              aria-label="Zoom in"
            >
              +
            </a>
            <a
              className="leaflet-control-zoom-out"
              href="#"
              title="Zoom out"
              role="button"
              aria-label="Zoom out"
            >
              -
            </a>
          </div>
        </div>

        {validDisasters.map((disaster) => (
          <Marker
            key={disaster.eventid}
            position={[
              parseFloat(disaster.latitude),
              parseFloat(disaster.longitude),
            ]}
            icon={getDisasterIcon(disaster, isMobile)}
            eventHandlers={{
              click: (e) => {
                // Stop the event from propagating to the map
                e.originalEvent.preventDefault();
                e.originalEvent.stopPropagation();
                onMarkerClick(disaster);
              },
            }}
          >
            {/* Add pulsing animation to the marker if it's the highlighted one */}
            {highlightedDisaster &&
              highlightedDisaster.eventid === disaster.eventid && (
                <div
                  className="pulse-marker"
                  style={{
                    position: "absolute",
                    width: "40px",
                    height: "40px",
                    backgroundColor: "rgba(255, 0, 0, 0.3)",
                    borderRadius: "50%",
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "none",
                    animation: "pulse 1.5s infinite",
                    top: "50%",
                    left: "50%",
                  }}
                ></div>
              )}
            <Popup
              closeOnClick={true}
              autoPan={true}
              autoPanPadding={[20, 20]}
              sx={{ zIndex: "1000 !important" }}
            >
              <div
                style={{ padding: "8px" }}
                onClick={(e) => e.stopPropagation()}
              >
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
                {disaster.link && (
                  <a
                    href={disaster.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      marginTop: "6px",
                      fontSize: "13px",
                      color: "#1976d2",
                      textDecoration: "none",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Details
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        <FitBounds markers={markerPositions} />
        <PopupHandler selectedDisaster={selectedDisaster} />
      </MapContainer>

      {/* Add CSS for the pulse animation */}
      <style>
        {`
    @keyframes pulse {
      0% {
        transform: translate(-50%, -50%) scale(0.8);
        opacity: 0.7;
      }
      70% {
        transform: translate(-50%, -50%) scale(1.3);
        opacity: 0.2;
      }
      100% {
        transform: translate(-50%, -50%) scale(0.8);
        opacity: 0;
      }
    }
    .leaflet-container {
      z-index: 1;
    }
    .leaflet-top, .leaflet-bottom {
      z-index: 1000;
    }
  `}
      </style>
    </div>
  );
};

export default Map;
