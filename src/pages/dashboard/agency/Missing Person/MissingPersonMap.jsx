import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import osm from "../../../../components/osm-providers";
import { useNavigate } from "react-router-dom";
import { use } from "react";
import { Box } from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useLocation } from "react-router-dom";

// Custom Leaflet icon
const myIcon = new L.Icon({
  iconSize: [25, 41],
  iconAnchor: [10, 41],
  popupAnchor: [2, -40],
  iconUrl: "https://unpkg.com/leaflet@1.6/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.6/dist/images/marker-shadow.png"
});

const MissingPersonMap = ({ persons, selectedPerson }) => {
  const [center, setCenter] = useState({ lat: 15.4909, lng: 73.8278 });
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const markerRefs = useRef([]);
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up("xl"));

  useEffect(() => {
    const fetchLocation = async () => {
      markerRefs.current = [];
      try {
        setLoading(true);
        if (!persons.length) return;

        const locationMap = new Map();

        // Fetch all geocode results in parallel
        const locationPromises = persons.map((person) =>
          fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${person.last_seen_location}`)
            .then(res => res.json())
        );
        const locationResults = await Promise.all(locationPromises);

        locationResults.forEach((data, i) => {
          if (!data || data.length === 0) {
            console.error(`Location not found: ${persons[i].last_seen_location}`);
            return;
          }

          const { lat, lon } = data[0];
          const key = `${lat},${lon}`;

          if (!locationMap.has(key)) {
            locationMap.set(key, {
              position: [parseFloat(lat), parseFloat(lon)],
              locationName: persons[i].last_seen_location,
              persons: [],
            });
          }

          locationMap.get(key).persons.push({
            id: persons[i].id,
            name: persons[i].full_name,
            missingDate: persons[i].created_at,
            gender: persons[i].gender,
            age: persons[i].age,
            lastSeenLocation: persons[i].last_seen_location,
            description: persons[i].description,
            person_photo: persons[i].person_photo,
            identification_marks: persons[i].identification_marks,
          });
        });

        const markerArray = Array.from(locationMap.values());
        setMarkers(markerArray);

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
  }, [persons]);

  useEffect(() => {
    if (selectedPerson && markers.length > 0) {
      const markerEntry = markers.find((marker) =>
        marker.persons.some((p) => p.name === selectedPerson.full_name)
      );

      if (markerEntry) {
        const index = markers.indexOf(markerEntry);
        const tryOpenPopup = () => {
          const markerRef = markerRefs.current[index];
          if (markerRef && markerRef.openPopup) {
            markerRef.openPopup();
            if (mapRef.current) {
              mapRef.current.flyTo(markerEntry.position, 13);
            }
          } else {
            setTimeout(tryOpenPopup, 100);
          }
        };
        tryOpenPopup();
      }
    }
  }, [selectedPerson, markers]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", margin: "20px", fontSize: "18px", color: "#007bff" }}>
        <span style={{ fontSize: "18px", color: "black" }}>
          Loading map...
        </span>
      </div>
    );
  }

  if (markers.length === 0) {
    return (
      <div style={{ textAlign: "center", margin: "20px", fontSize: "18px", color: "#d32f2f" }}>
        ⚠️ No locations to display.
      </div>
    );
  }

  return (
    <Box sx={{ width: "100%", height: "100%", backgroundColor: "white" }}>
      {/* Map Container */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: isMobile ? "0px" : "12px",
          overflow: "hidden",
          mb: 2,
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          backgroundColor: "white",
          border: "1px solid #ccc",
        }}
      >
        <MapContainer
          center={center}
          zoom={9}
          scrollWheelZoom={true}
          style={{ 
            height: "100%",
            width: "100%",
            position: "absolute",
            zIndex: 1,
          }}
          whenCreated={(mapInstance) => { mapRef.current = mapInstance }}
          attributionControl={false}
        >
          <TileLayer attribution={""} url={osm.maptiler.url} />

          {markers.map((marker, index) => (
            <Marker
              key={index}
              position={marker.position}
              icon={myIcon}
              ref={(el) => markerRefs.current[index] = el}
            >
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
                    {marker.locationName.split(",").slice(0, 2).join(", ")}
                  </div>

                  {marker.persons.map((person, i) => {
                    const dateObj = new Date(person.missingDate);
                    const date = isNaN(dateObj.getTime()) ? "Unknown" : dateObj.toISOString().split("T")[0];
                    const time = isNaN(dateObj.getTime()) ? "Unknown" : dateObj.toTimeString().split(" ")[0];
                    return (
                      <div
                        key={i}
                        style={{
                          marginBottom: "10px",
                          borderBottom: "1px solid #ccc",
                          paddingBottom: "8px",
                        }}
                      >
                        <span style={{ color: "#d32f2f", fontSize: "16px", fontWeight: 600 }}>
                          {person.name}
                        </span>
                        <br />
                        <span style={{ color: "#555", fontSize: "14px" }}>
                          Date: {date} <br />
                          Time: {time}
                        </span>
                        <br />
                        <span
                          onClick={() =>
                            navigate(`/person-details/${person.id}`, {
                              state: { person },
                            })
                          }
                          style={{
                            color: "#1976d2",
                            cursor: "pointer",
                            fontSize: "10px",
                            marginTop: "4px",
                            display: "inline-block",
                          }}
                        >
                          View Details
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>
    </Box>
  );
};

export default MissingPersonMap;