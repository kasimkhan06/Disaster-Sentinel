import React, { useState, useEffect, useRef } from "react";
import { Typography, Box, Card, CardContent } from "@mui/material";
import Grid from "@mui/material/Grid";
import { DataGrid } from "@mui/x-data-grid"; 
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import osm from "../../../../components/osm-providers";
import { useNavigate } from "react-router-dom";

// Leaflet icon
const myIcon = new L.Icon({
    iconSize: [25, 41],
    iconAnchor: [10, 41],
    popupAnchor: [2, -40],
    iconUrl: "https://unpkg.com/leaflet@1.6/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.6/dist/images/marker-shadow.png"
});

const MissingPerson = () => {
    const [pageSize, setPageSize] = useState(5);
    const navigate = useNavigate();

    const rows = [
        { 
            id: 1, 
            name: "John Doe", 
            location: "Panjim", 
            address: "Altino Panjim", 
            missingDate: "10 Jan 2023", 
            gender: "Male", 
            mark: "Scar on the left eye", 
            age: 30, 
            img: "/assets/pexels-rpnickson-2559941.jpg",
            description: "Last seen near Altino Panjim wearing a blue shirt and jeans. Scar on the left eye."
        },
        { 
            id: 2, 
            name: "Jane Doe", 
            location: "Margao", 
            address: "Fatorda, Margao", 
            missingDate: "15 Feb 2023", 
            gender: "Female", 
            mark: "Mole on the right cheek", 
            age: 25, 
            img: "/assets/pexels-rpnickson-2559941.jpg",
            description: "Disappeared from Fatorda, Margao. Last seen wearing a red dress near the bus stand."
        },
        { 
            id: 3, 
            name: "John Smith", 
            location: "Mapusa", 
            address: "Karaswada, Mapusa", 
            missingDate: "05 Mar 2023", 
            gender: "Male", 
            mark: "Tattoo on left arm", 
            age: 40, 
            img: "/assets/pexels-rpnickson-2559941.jpg",
            description: "Left home for work and did not return. Has a tribal tattoo on his left arm."
        },
        { 
            id: 4, 
            name: "Emily Johnson", 
            location: "Mormugao", 
            address: "Dabolim, Vasco", 
            missingDate: "12 Apr 2023", 
            gender: "Female", 
            mark: "Burn mark on right hand", 
            age: 35, 
            img: "/assets/pexels-rpnickson-2559941.jpg",
            description: "Was last seen near Dabolim railway station. Recognizable by a burn mark on her right hand."
        },
        { 
            id: 5, 
            name: "Michael Brown", 
            location: "Ponda", 
            address: "Farmagudi, Ponda", 
            missingDate: "20 May 2023", 
            gender: "Male", 
            mark: "Gap between front teeth", 
            age: 50, 
            img: "/assets/pexels-rpnickson-2559941.jpg",
            description: "Last seen at the Ponda market. Has a noticeable gap between his front teeth."
        },
        { 
            id: 6, 
            name: "Raju", 
            location: "Ponda", 
            address: "Farmagudi, Ponda", 
            missingDate: "20 May 2023", 
            gender: "Male", 
            mark: "Gap between front teeth", 
            age: 50, 
            img: "/assets/pexels-rpnickson-2559941.jpg",
            description: "Seen last near a tea stall at Farmagudi. He has a distinct gap in his front teeth."
        },
        { 
            id: 7, 
            name: "Michael Doe", 
            location: "Valpoi", 
            address: "Farmagudi, Ponda", 
            missingDate: "20 May 2023", 
            gender: "Male", 
            mark: "Gap between front teeth", 
            age: 50, 
            img: "/assets/pexels-rpnickson-2559941.jpg",
            description: "Went missing near Valpoi bus stop. Wore a white shirt and black pants."
        },
        { 
            id: 8, 
            name: "Michael Doe", 
            location: "Valpoi", 
            address: "Farmagudi, Ponda", 
            missingDate: "20 May 2023", 
            gender: "Male", 
            mark: "Gap between front teeth", 
            age: 50, 
            img: "/assets/pexels-rpnickson-2559941.jpg",
            description: "Reported missing from a roadside eatery in Valpoi. Had a small bag with him."
        }
    ];     

    const columns = [
        { 
            field: "img", 
            headerName: "Profile Image", 
            width: 120,
            renderCell: (params) => (
                <Box 
                    sx={{ 
                        display: "flex", 
                        justifyContent: "center", 
                        alignItems: "center", 
                        width: "100%", 
                        height: "100%" 
                    }}
                >
                    <img 
                        src={params.value} 
                        alt="Profile"
                        style={{ width: 80, height: 80 }} 
                    />
                </Box>
            )
        },
        { field: "name", headerName: "Name", width: 200 },
        { field: "location", headerName: "Location", width: 150 },
        { field: "missingDate", headerName: "Missing Date", width: 180 }
    ];

    return (
        <Box sx={{ p: 2 }}>
            <Typography
                align="left"
                sx={{
                    mt: 10,
                    ml: { xs: 2, sm: 4, md: 4 },
                    mb: 2,
                }}
                variant="h4"
            >
                Missing Persons
            </Typography>
            <Grid container spacing={4} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: 550, display: "flex", flexDirection: "column" }}>
                        <CardContent sx={{ flexGrow: 1, overflow: "auto" }}>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            pageSize={pageSize}
                            rowHeight={100}
                            autoHeight
                            onRowClick={(params) => navigate(`/person-details/${params.id}`, { state: { person: params.row } })}
                        />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <MapLeaflet name={rows.map((row) => row.name)} missingDate={rows.map((row) => row.missingDate)} locations={rows.map((row) => row.location)} />
                </Grid>
            </Grid>
        </Box>
    );
};

const MapLeaflet = ({ name, missingDate, locations }) => {
    const ZOOM_LEVEL = 10;
    const [center, setCenter] = useState({ lat: 15.4909, lng: 73.8278 }); 
    const [markers, setMarkers] = useState([]);
    const mapRef = useRef(null);

    useEffect(() => {
        const fetchLocation = async () => {
            try {
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
                        locationMap.set(key, { position: [parseFloat(lat), parseFloat(lon)], persons: [] });
                    }
    
                    locationMap.get(key).persons.push({ name: name[i], missingDate: missingDate[i] });
                }
    
                setMarkers(Array.from(locationMap.values())); 
            } catch (error) {
                console.error("Error fetching location data:", error);
            }
        };
    
        fetchLocation();
    }, [locations]);   
    

    return (
        <MapContainer
            center={center}
            zoom={ZOOM_LEVEL}
            scrollWheelZoom={false}
            style={{ height: "550px", width: "100%" }}
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
                            {/* Display Location Once */}
                            <div style={{
                                fontSize: "16px",
                                fontWeight: "bold",
                                color: "#007bff",
                                marginBottom: "8px",
                                borderBottom: "2px solid #007bff",
                                paddingBottom: "5px"
                            }}>
                                {locations[index]} 
                            </div>

                            {/* Display Persons List */}
                            {marker.persons.map((person, i) => (
                                <div key={i} style={{ marginBottom: "5px", borderBottom: "1px solid #ccc", paddingBottom: "5px" }}>
                                    <span style={{ color: "#d32f2f", fontSize: "16px" }}>
                                        {person.name}
                                    </span><br />
                                    <span style={{ color: "#555" }}>Missing date: {person.missingDate}</span><br />
                                </div>
                            ))}
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MissingPerson;