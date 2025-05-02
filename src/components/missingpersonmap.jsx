// src/components/MissingPersonMap.jsx (Example Path)
import React, { useEffect } from 'react';
import Grid from "@mui/material/Grid2";
import { Card, Typography, Box } from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// --- Leaflet Icon Fix ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
// --- End Icon Fix ---

// --- MapUpdater Component ---
// This component uses the useMap hook to get the map instance
// and updates its view when the position prop changes.
const MapUpdater = ({ position, zoom }) => {
    const map = useMap(); // Get map instance

    useEffect(() => {
        if (position) {
            // flyTo provides a smooth animation to the new position and zoom
            map.flyTo(position, zoom);
        }
        // Add dependencies: map, position, zoom
    }, [map, position, zoom]);

    return null; // This component does not render anything itself
}
// --- End MapUpdater Component ---


const MissingPersonMap = ({ formData, imagePreviews }) => {
    // Default center and zoom for initial load
    const defaultCenter = [20.5937, 78.9629]; // India approx center
    const defaultZoom = 5;
    const focusZoom = 14; // Zoom level when focusing on a location

    return (
        <Grid container direction="column" spacing={3}>
            {/* Map Card */}
            <Grid size={12}>
                <Card sx={{ p: 3, borderRadius: 3, boxShadow: 0, position: "relative", overflow: "hidden" }}>
                    <Typography
                        align="center"
                        sx={{
                            mt: 0,
                            mb: 1,
                            fontSize: { xs: "1rem", sm: "1.2rem", md: "1.2rem", lg: "1.2rem" },
                            fontWeight: "500",
                        }}
                    >
                        Last Seen Location Map
                    </Typography>
                    <Box sx={{ position: "relative", width: "100%", height: "400px", borderRadius: 2, overflow: "hidden", mt: 2 }}>
                        <MapContainer
                            center={defaultCenter} // Initial center
                            zoom={defaultZoom}     // Initial zoom
                            style={{ height: "100%", width: "100%", position: "absolute", zIndex: 1 }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                // IMPORTANT: Add attribution for OpenStreetMap
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
                            />
                            {/* Marker appears only if lastSeen coordinates exist */}
                            {formData.lastSeen && (
                                <Marker position={formData.lastSeen}>
                                    <Popup>
                                        {/* Show typed place name or coordinates */}
                                        {formData.lastSeenPlace || `Lat: ${formData.lastSeen[0]?.toFixed(4)}, Lng: ${formData.lastSeen[1]?.toFixed(4)}`}
                                    </Popup>
                                </Marker>
                            )}
                            {/* This component handles map view changes */}
                            <MapUpdater position={formData.lastSeen} zoom={focusZoom} />
                        </MapContainer>
                        {/* Optional: Gradient overlay for aesthetics */}
                        <Box
                            sx={{
                                position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none",
                                background: `
                                    linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 3%),
                                    linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 3%),
                                    linear-gradient(to left, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 3%),
                                    linear-gradient(to right, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 3%)
                                `,
                                zIndex: 2, // Ensure it's above the map tiles
                            }}
                        />
                    </Box>
                </Card>
            </Grid>

            {/* Image Previews Card (remains the same) */}
            {(imagePreviews.photo || imagePreviews.idCard) && (
                <Grid size={12}>
                    <Card sx={{ p: 3, borderRadius: 3, boxShadow: 0 }}>
                        <Typography
                            align="center"
                            sx={{
                                mt: 0,
                                mb: 1,
                                fontSize: { xs: "1rem", sm: "1.2rem", md: "1.2rem", lg: "1.2rem" },
                                fontWeight: "500",
                            }}
                        >
                            Uploaded Images Preview
                        </Typography>
                        <Grid container spacing={2} justifyContent="center">
                            {imagePreviews.photo && (
                                <Grid item size={imagePreviews.idCard ? { xs: 12, sm: 6 } : { xs: 12 }}>
                                    <img src={imagePreviews.photo} alt="Uploaded Photo Preview" style={{ width: "100%", borderRadius: 8, border: '1px solid #eee' }} />
                                    <Typography align="center" variant="caption" display="block" sx={{ mt: 1 }}>Photo Preview</Typography>
                                </Grid>
                            )}
                            {imagePreviews.idCard && (
                                <Grid item size={imagePreviews.idCard ? { xs: 12, sm: 6 } : { xs: 12 }}>
                                    <img src={imagePreviews.idCard} alt="Uploaded ID Card Preview" style={{ width: "100%", borderRadius: 8, border: '1px solid #eee' }} />
                                    <Typography align="center" variant="caption" display="block" sx={{ mt: 1 }}>ID Card Preview</Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Card>
                </Grid>
            )}
        </Grid>
    );
};

export default MissingPersonMap;