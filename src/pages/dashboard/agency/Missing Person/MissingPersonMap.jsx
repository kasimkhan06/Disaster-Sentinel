import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import osm from "../../../../components/osm-providers";

// Custom Leaflet icon
const myIcon = new L.Icon({
  iconSize: [25, 41],
  iconAnchor: [10, 41],
  popupAnchor: [2, -40],
  iconUrl: "https://unpkg.com/leaflet@1.6/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.6/dist/images/marker-shadow.png"
});

// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: markerIcon2x,
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
// });

const MissingPersonMap = ({ name, missingDate, locations }) => {
  const [center, setCenter] = useState({ lat: 15.4909, lng: 73.8278 }); // Default center
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setLoading(true);
        if (!locations.length) return;

        const locationMap = new Map();

        for (let i = 0; i < locations.length; i++) {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${locations[i]}`
          );
          const data = await response.json();

          if (data.length === 0) {
            console.error(`Location not found: ${locations[i]}`);
            continue;
          }

          const { lat, lon } = data[0];
          const key = `${lat},${lon}`;

          if (!locationMap.has(key)) {
            locationMap.set(key, {
              position: [parseFloat(lat), parseFloat(lon)],
              locationName: locations[i], // Store original location label
              persons: [],
            });
          }

          locationMap.get(key).persons.push({
            name: name[i],
            missingDate: missingDate[i],
          });
        }

        const markerArray = Array.from(locationMap.values());
        setMarkers(markerArray);

        // Center the map to the first marker
        if (markerArray.length > 0) {
          setCenter({
            lat: markerArray[0].position[0],
            lng: markerArray[0].position[1],
          });
        }
      } catch (error) {
        console.error("Error fetching location data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [locations, name, missingDate]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", margin: "20px", fontSize: "18px", color: "#007bff" }}>
        <span style={{ fontSize: "18px", color: "black" }}>
           🔄 Loading map data...
        </span>
      </div>
    );
  }

  if (markers.length === 0) {
    return (
      <div style={{ textAlign: "center", margin: "20px", fontSize: "18px", color: "#d32f2f" }}>
        ⚠️ No valid locations to display.
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={9}
      scrollWheelZoom={true}
      style={{ height: "500px", width: "100%", borderRadius: "10px" }}
      ref={mapRef}
    >
      <TileLayer attribution={osm.maptiler.attribution} url={osm.maptiler.url} />

      {markers.map((marker, index) => (
        <Marker key={index} position={marker.position} icon={myIcon}>
          <Popup>
            <div style={{
              textAlign: "center",
              fontSize: "14px",
              fontWeight: "bold",
              color: "#333",
              padding: "5px",
              borderRadius: "5px"
            }}>
              <div style={{
                fontSize: "16px",
                fontWeight: "bold",
                color: "#007bff",
                marginBottom: "8px",
                borderBottom: "2px solid #007bff",
                paddingBottom: "5px"
              }}>
                {marker.locationName}
              </div>

              {marker.persons.map((person, i) => (
                <div key={i} style={{ marginBottom: "5px", borderBottom: "1px solid #ccc", paddingBottom: "5px" }}>
                  <span style={{ color: "#d32f2f", fontSize: "16px" }}>
                    {person.name}
                  </span>
                  <br />
                  <span style={{ color: "#555" }}>Missing date: {person.missingDate}</span>
                </div>
              ))}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MissingPersonMap;
