// src/components/InteractiveMap.jsx (Example Path)
import React, { useState, useRef, useCallback, useEffect } from "react";
import { TileLayer, MapContainer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import { MyLocation as MyLocationIcon } from "@mui/icons-material"; // SearchIcon removed
import { Button, Typography, Stack, Box, IconButton, CircularProgress } from "@mui/material"; // InputBase, styled, alpha removed
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Helpers and Hooks
import osm from "../components/osm-providers"; // Adjust path
import UserGeoLocation from "../components/UserGeoLocation"; // Adjust path
import { reverseGeocode } from "../components/ReverseGeocode"; // Adjust path

// --- Leaflet Icon Setup ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
// --- End Icon Setup ---

// --- Map Event Handler Component ---
function MapClickHandler({ onMapClick }) {
    useMapEvents({
        click: (e) => {
            const { lat, lng } = e.latlng;
            onMapClick(lat, lng);
        }
    });
    return null;
}
// --- End Map Event Handler ---

// --- Component to Update Map View ---
function MapViewUpdater({ position, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (position && position.length === 2) {
            map.flyTo(position, zoom, { animate: true, duration: 1 });
        }
    }, [position, zoom, map]);
    return null;
}
// --- End Map View Updater ---


// --- Main InteractiveMap Component ---
// Removed handleInputChange prop
const InteractiveMap = ({ formData, setFormData, setError }) => {

    // State for loading indicators
    // Removed isSearching state
    const [isLocating, setIsLocating] = useState(false);
    const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

    const location = UserGeoLocation();
    const mapRef = useRef(null);

    const INITIAL_ZOOM = 5;
    const FOCUS_ZOOM = 14;
    const INITIAL_CENTER = [20.5937, 78.9629];

    // --- Map Interaction Handlers ---

    const handleMapClick = useCallback(async (lat, lng) => {
        setIsReverseGeocoding(true);
        setError('');
        try {
            const placeName = await reverseGeocode(lat, lng);
            setFormData(prev => ({
                ...prev,
                lastSeen: [lat, lng],
                lastSeenPlace: placeName
            }));
        } catch (err) {
             console.error("Map click reverse geocode error:", err);
             setFormData(prev => ({
                ...prev,
                lastSeen: [lat, lng],
                lastSeenPlace: `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
            }));
        } finally {
            setIsReverseGeocoding(false);
        }
    }, [setFormData, setError]);

    // REMOVED: searchLocation function

    const showMyLocation = useCallback(async () => {
        setIsLocating(true);
        setError('');

        if (location.loaded) {
            if (location.error) {
                setError(`Could not get current location: ${location.error.message}`);
                setIsLocating(false);
            } else {
                const { lat, lng } = location.coordinates;
                setIsReverseGeocoding(true);
                 try {
                    const placeName = await reverseGeocode(lat, lng);
                    setFormData(prev => ({
                        ...prev,
                        lastSeen: [lat, lng],
                        lastSeenPlace: placeName
                    }));
                } catch(err) {
                     console.error("Locate me reverse geocode error:", err);
                     setFormData(prev => ({
                        ...prev,
                        lastSeen: [lat, lng],
                        lastSeenPlace: `Current Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
                    }));
                } finally {
                     setIsReverseGeocoding(false);
                     setIsLocating(false);
                }
            }
        } else {
             setError("Getting current location... Please wait and try again.");
             setIsLocating(false);
        }
    }, [location, setFormData, setError]);

    // REMOVED: handleSearchKeyPress function

    const currentCenter = formData.lastSeen || INITIAL_CENTER;

    return (
        // Simplified layout: Removed outer Box, Stack, SearchBar
        <>
             {/* Display Reverse Geocoding Status */}
             {isReverseGeocoding && <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>Getting location name...</Typography>}

             {/* Locate Me Button - Now separate */}
             {/* <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'center' }}> 
                <Button
                    variant="outlined"
                    size="medium"
                    onClick={showMyLocation}
                    startIcon={isLocating ? <CircularProgress size={18} color="inherit" /> : <MyLocationIcon />}
                    disabled={isLocating} // Only disable while locating
                    sx={{ flexShrink: 0 }}
                >
                    Locate Me on Map
                </Button>
             </Box> */}

            {/* Map Container */}
            <Box sx={{ height: "400px", width: "100%", borderRadius: 1, overflow: 'hidden', border: '1px solid #ccc' }}>
                 <MapContainer
                    center={currentCenter}
                    zoom={formData.lastSeen ? FOCUS_ZOOM : INITIAL_ZOOM}
                    scrollWheelZoom={true}
                    style={{ height: "100%", width: "100%" }}
                    whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
                >
                    <TileLayer attribution={osm.maptiler.attribution} url={osm.maptiler.url} />

                    {formData.lastSeen && formData.lastSeen.length === 2 && (
                        <Marker position={formData.lastSeen} >
                            <Popup>
                                {formData.lastSeenPlace || `Selected: ${formData.lastSeen[0].toFixed(4)}, ${formData.lastSeen[1].toFixed(4)}`}
                            </Popup>
                        </Marker>
                    )}

                    <MapClickHandler onMapClick={handleMapClick} />
                    <MapViewUpdater position={formData.lastSeen} zoom={FOCUS_ZOOM} />
                </MapContainer>
            </Box>
             {/* Map Attribution */}
             {/* <Typography variant="caption" display="block" sx={{ mt: 1, fontSize: '0.7rem', textAlign: 'center', color: 'text.secondary' }}>
                Map data &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors | Location search by <a href="https://nominatim.org/" target="_blank" rel="noopener noreferrer">Nominatim</a>
            </Typography> */}
        </> // Used Fragment as outer container is removed
    );
};

export default InteractiveMap;
