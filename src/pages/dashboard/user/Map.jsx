import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { Link } from "react-router-dom";
import { Tooltip } from "react-leaflet";

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
};

const disasterIcons = {
  eq: {
    options: {
      iconUrl: "https://www.gdacs.org/Images/gdacs_icons/alerts/Green/EQ.png",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    },
  },
  fl: {
    options: {
      iconUrl: "https://www.gdacs.org/Images/gdacs_icons/alerts/Green/FL.png",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    },
  },
  default: {
    options: {
      iconUrl: markerIcon,
      iconRetinaUrl: markerIcon2x,
      shadowUrl: markerShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    },
  },
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

const Map = ({
  disasters,
  floodPredictions = [],
  onMarkerClick,
  selectedDisaster,
  highlightedDisaster,
  isMobile,
}) => {
  const mapRef = useRef(null);
  const navigate = useNavigate();

  const validDisasters = disasters.filter(
    (disaster) => disaster.latitude && disaster.longitude
  );

  const validFloodPredictions = floodPredictions.filter(
    (prediction) => prediction.latitude && prediction.longitude
  );

  const allMarkerPositions = [
    ...validDisasters.map((disaster) => [
      parseFloat(disaster.latitude),
      parseFloat(disaster.longitude),
    ]),
    ...validFloodPredictions.map((prediction) => [
      parseFloat(prediction.latitude),
      parseFloat(prediction.longitude),
    ]),
  ];

  if (validDisasters.length === 0) {
    return (
      <p style={{ padding: "16px", margin: "16px", textAlign: "center" }}>
        No disasters with valid location data.
      </p>
    );
  }

  const getDisasterIcon = (disaster, isMobile) => {
    const eventType = disaster.eventtype?.toUpperCase();
    const alertLevel = disaster.alertlevel?.toLowerCase();
    const iconSize = isMobile ? [24, 24] : [32, 32];
    const iconAnchor = isMobile ? [12, 12] : [16, 16];
    const popupAnchor = isMobile ? [0, -12] : [0, -16];

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

    const type = disaster.eventtype?.toLowerCase();
    if (type && disasterIcons[type]) {
      const icon = L.icon(disasterIcons[type].options);
      if (isMobile) {
        icon.options.iconSize = iconSize;
        icon.options.iconAnchor = iconAnchor;
        icon.options.popupAnchor = popupAnchor;
      }
      return icon;
    }

    const defaultIcon = L.icon(disasterIcons.default.options);
    if (isMobile) {
      defaultIcon.options.iconSize = iconSize;
      defaultIcon.options.iconAnchor = iconAnchor;
      defaultIcon.options.popupAnchor = popupAnchor;
    }
    return defaultIcon;
  };

  const getFloodPredictionIcon = (prediction, isMobile) => {
    const iconSize = isMobile ? [20, 20] : [25, 25];
    const riskLevel = prediction.riskLevel?.toLowerCase() || 'medium';
    
    // Colors and animation settings based on risk level
    const riskStyles = {
      high: {
        color: 'rgba(238, 11, 11, 0.7)', // Red
        pulseColor: 'rgba(51, 15, 15, 0.7)',
        pulseSize: '12px',
        pulseSpeed: '1s'
      },
      medium: {
        color: 'rgba(255, 115, 0, 0.72)', // Orange
        pulseColor: 'rgba(255, 153, 0, 0.7)',
        pulseSize: '8px',
        pulseSpeed: '1.5s'
      },
      low: {
        color: 'rgba(29, 168, 16, 0.7)', // Blue
        pulseColor: 'rgba(22, 66, 18, 0.7)',
        pulseSize: '5px',
        pulseSpeed: '2s'
      }
    };

    const style = riskStyles[riskLevel] || riskStyles.low;

    const html = `
      <div style="
        width: ${iconSize[0]}px;
        height: ${iconSize[1]}px;
        background-color: ${style.color};
        border-radius: 50%;
        animation: pulse-${riskLevel} ${style.pulseSpeed} infinite;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
      ">
        <div style="
          width: 60%;
          height: 60%;
          background-color: white;
          border-radius: 50%;
          opacity: 0.8;
          position: relative;
          z-index: 2;
        "></div>
      </div>
    `;

    return L.divIcon({
      html,
      className: `flood-prediction-marker flood-risk-${riskLevel}`,
      iconSize: [iconSize[0], iconSize[1]],
      iconAnchor: [iconSize[0] / 2, iconSize[1] / 2],
    });
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <MapContainer
        center={[20, 0]}
        zoom={isMobile ? 1 : 2}
        style={{
          height: "100%",
          width: "100%",
          filter: "brightness(0.85) contrast(1.4) saturate(0.8) hue-rotate(10deg)",
        }}
        zoomControl={false}
        ref={mapRef}
        worldCopyJump={true}
      >
        <TileLayer
          attribution=""
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          noWrap={false}
        />

        <div className="leaflet-bottom leaflet-left">
          <div className="leaflet-control leaflet-bar leaflet-control-zoom">
            <a className="leaflet-control-zoom-in" href="#" title="Zoom in" role="button" aria-label="Zoom in">
              +
            </a>
            <a className="leaflet-control-zoom-out" href="#" title="Zoom out" role="button" aria-label="Zoom out">
              -
            </a>
          </div>
        </div>

        {validDisasters.map((disaster) => (
          <Marker
            key={disaster.eventid}
            position={[parseFloat(disaster.latitude), parseFloat(disaster.longitude)]}
            icon={getDisasterIcon(disaster, isMobile)}
            eventHandlers={{
              click: (e) => {
                e.originalEvent.preventDefault();
                e.originalEvent.stopPropagation();
                onMarkerClick(disaster);
              },
            }}
          >
            {highlightedDisaster && highlightedDisaster.eventid === disaster.eventid && (
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
            <Popup closeOnClick={true} autoPan={true} autoPanPadding={[20, 20]} sx={{ zIndex: "1000 !important" }}>
              <div style={{ padding: "8px" }} onClick={(e) => e.stopPropagation()}>
                <strong style={{ display: "block", marginBottom: "4px" }}>{disaster.title}</strong>
                <p style={{ margin: "2px 0", fontSize: "13px" }}>
                  Type: {disasterTypeMap[disaster.eventtype] || disaster.eventtype}
                </p>
                {disaster.pubDate && (
                  <p style={{ margin: "2px 0", fontSize: "13px" }}>Date: {disaster.pubDate}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {validFloodPredictions.map((prediction) => {
          const lat = parseFloat(prediction.latitude);
          const lng = parseFloat(prediction.longitude);
          const riskLevel = prediction.riskLevel?.toLowerCase() || 'medium';

          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker
              key={`flood-${prediction.stationId || "static"}`}
              position={[lat, lng]}
              icon={getFloodPredictionIcon(prediction, isMobile)}
            >
              <Tooltip permanent direction="top" offset={[0, -10]}>
                <div style={{ fontWeight: "bold" }}>
                  Flood Risk: {prediction.riskLevel || "low"}
                </div>
                <div>
                  Probability: {(prediction.probability * 100).toFixed(2)}%
                </div>
              </Tooltip>
            </Marker>
          );
        })}

        <FitBounds markers={allMarkerPositions} />
        <PopupHandler selectedDisaster={selectedDisaster} />
      </MapContainer>

      <style>
        {`
          /* Base pulse animation */
          @keyframes pulse {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(0, 0, 0, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
          }

          /* Risk-specific pulse animations */
          @keyframes pulse-high {
            0% { box-shadow: 0 0 0 0 rgba(173, 50, 50, 0.7); }
            70% { box-shadow: 0 0 0 12px rgba(255, 0, 0, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); }
          }

          @keyframes pulse-medium {
            0% { box-shadow: 0 0 0 0 rgba(158, 106, 28, 0.7); }
            70% { box-shadow: 0 0 0 8px rgba(192, 125, 25, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 153, 0, 0); }
          }

          @keyframes pulse-low {
            0% { box-shadow: 0 0 0 0 rgba(25, 100, 59, 0.7); }
            70% { box-shadow: 0 0 0 5px rgba(0, 153, 255, 0); }
            100% { box-shadow: 0 0 0 0 rgba(0, 153, 255, 0); }
          }

          .flood-prediction-marker {
            background: transparent !important;
            border: none !important;
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