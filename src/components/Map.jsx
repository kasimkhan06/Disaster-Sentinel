import React, { useState, useRef, useCallback } from "react";
import { TileLayer, MapContainer, Marker, Popup, useMapEvents } from "react-leaflet";
import { MyLocation as MyLocationIcon } from "@mui/icons-material";
import { Search as MySearchIcon } from "@mui/icons-material";
import { Button, Typography, Stack, Box, IconButton, InputBase } from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import L from "leaflet";
import osm from "./osm-providers";
import UserGeoLocation from "../hooks/UserGeoLocation";

const myIcon = new L.Icon({
    iconSize: [25, 41],
    iconAnchor: [10, 41],
    popupAnchor: [2, -40],
    iconUrl: "https://unpkg.com/leaflet@1.6/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.6/dist/images/marker-shadow.png"
});

function ClickHandler({ saveMarkers }) {
    useMapEvents({
        click: (e) => {
            const { lat, lng } = e.latlng;
            saveMarkers([lat, lng]);
        }
    });
    return null;
}

const Search = styled("div")(({ theme }) => ({
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    "&:hover": { backgroundColor: alpha(theme.palette.common.white, 0.25) },
    display: "flex",
    alignItems: "center",
    width: "100%",
    maxWidth: 350,
    border: "1px solid #ccc",
    padding: "4px 10px"
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    flex: 1,
    color: "inherit",
    "& .MuiInputBase-input": {
        padding: theme.spacing(1, 1, 1, 0),
        transition: theme.transitions.create("width"),
        width: "100%"
    }
}));

const SearchBar = React.memo(({ city, setCity, searchCity }) => {
    const handleChange = useCallback((e) => {
        setCity(e.target.value);
    }, [setCity]);

    return (
        <Box display="flex" alignItems="center">
            <Search>
                <StyledInputBase
                    placeholder="Enter city name"
                    value={city}
                    onChange={handleChange}
                    inputProps={{ "aria-label": "search" }}
                />
                <IconButton onClick={searchCity} sx={{ color: "#4F646F" }}>
                    <MySearchIcon />
                </IconButton>
            </Search>
        </Box>
    );
});

function MapLeaflet({ markers, setMarkers }) {
    const [center, setCenter] = useState({ lat: 51.505, lng: -0.09 });
    const [city, setCity] = useState("");
    const location = UserGeoLocation();
    const mapRef = useRef(null);
    const ZOOM_LEVEL = 14;

    const saveMarkers = useCallback((newMarkerCoords) => {
        setMarkers([newMarkerCoords]);
    }, [setMarkers]);

    const showMyLocation = useCallback(() => {
        if (location.loaded && !location.error) {
            saveMarkers([location.coordinates.lat, location.coordinates.lng]);
            mapRef.current.setView(
                [location.coordinates.lat, location.coordinates.lng],
                ZOOM_LEVEL,
                { animate: true }
            );
        } else {
            alert("Location could not be found!");
        }
    }, [location, saveMarkers]);

    const searchCity = useCallback(async () => {
        if (city.trim() === "") return alert("Enter a valid city name!");

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${city}`
            );
            const data = await response.json();

            if (data.length === 0) {
                alert("City not found!");
                return;
            }

            const { lat, lon } = data[0];
            setCenter({ lat: parseFloat(lat), lng: parseFloat(lon) });
            mapRef.current.setView([parseFloat(lat), parseFloat(lon)], ZOOM_LEVEL, { animate: true });
        } catch (error) {
            console.error("Error fetching city data:", error);
        }
    }, [city]);

    return (
        <div>
            <Typography variant="h8" sx={{ fontWeight: "normal" }}>
                Specify the location for this entry by clicking/tapping the map
            </Typography>

            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ marginTop: "10px" }}>
                <SearchBar city={city} setCity={setCity} searchCity={searchCity} />
                <Button
                    variant="contained"
                    onClick={showMyLocation}
                    startIcon={<MyLocationIcon />}
                    sx={{
                        backgroundColor: "#4F646F",
                        color: "#fff",
                        "&:hover": {
                            backgroundColor: "#6B7A85"
                        }
                    }}
                >
                    Locate Me
                </Button>
            </Stack>

            <MapContainer
                center={center}
                zoom={ZOOM_LEVEL}
                scrollWheelZoom={false}
                style={{ 
                    height: "350px", 
                    width: "100%", 
                    marginTop: "10px", 
                    borderRadius: "5px", 
                    border: "1px solid #ccc", 
                    boxShadow: "0 2px 5px rgba(0,0,0,0.3)", 
                    filter: "brightness(0.85) contrast(1.4) saturate(0.8) hue-rotate(10deg)",
                }}
                ref={mapRef}
            >
                <TileLayer attribution={osm.maptiler.attribution} url={osm.maptiler.url} />

                {markers.length > 0 && (
                    <Marker position={markers[0]} icon={myIcon}>
                        <Popup>Marker at {markers[0][0].toFixed(4)}, {markers[0][1].toFixed(4)}</Popup>
                    </Marker>
                )}

                <ClickHandler saveMarkers={saveMarkers} />
            </MapContainer>
        </div>
    );
}

export default MapLeaflet;