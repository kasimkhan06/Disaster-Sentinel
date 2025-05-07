import React, { useState, useEffect, useCallback } from "react";
import {
    Container,
    Card,
    Typography,
    TextField,
    Button,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Box,
    Avatar,
    Autocomplete,
    CircularProgress,
    Alert, // Import Alert for feedback
} from "@mui/material";
import worldMapBackground from "/assets/background_image/world-map-background.jpg";

const API_BASE_URL = "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api";

// Helper function to map API data to component state structure
const mapApiResponseToSelectedPerson = (apiData) => {
    if (!apiData) return null;

    // Derive status based on additional_info content
    let currentStatus = "Under Investigation"; // Default status
    let displayAdditionalInfo = apiData.additional_info || "";
    let isMarkedFound = false;

    if (typeof displayAdditionalInfo === 'string' && displayAdditionalInfo.startsWith("[FOUND]")) {
        currentStatus = "Found";
        // Optionally remove the tag for display in the main info area if desired,
        // but keep it for the edit field. For simplicity here, we display as is.
        // displayAdditionalInfo = displayAdditionalInfo.substring(7).trim();
        isMarkedFound = true;
    }

    return {
        id: apiData.id,
        name: apiData.full_name || "N/A",
        age: apiData.age || "N/A",
        gender: apiData.gender || "N/A",
        status: currentStatus, // Derived status
        disasterType: apiData.disaster_type || "N/A",
        contactInfo: apiData.reporter_contact_info || "N/A", // Mapped from API
        additionalInfo: apiData.additional_info || "", // Original info for editing
        displayAdditionalInfo: displayAdditionalInfo, // Info potentially without tag for display card
        lastSeen: apiData.last_seen_location || "N/A", // Mapped from API
        photo: apiData.person_photo || null, // Mapped from API (detail view provides URL)
        isMarkedFound: isMarkedFound, // Flag if the marker is present
        // Include other fields from detail view if needed e.g. description
        description: apiData.description || "N/A",
    };
};


const StatusTracking = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPerson, setSelectedPerson] = useState(null); // Stores detailed data from GET /details/{pk}
    const [editedInfo, setEditedInfo] = useState({ additionalInfo: "" });
    const [reportList, setReportList] = useState([]); // Stores concise list from GET /list
    const [loadingList, setLoadingList] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch the list of reports for the Autocomplete
    useEffect(() => {
        const fetchReportList = async () => {
            setLoadingList(true);
            setError('');
            try {
                const response = await fetch(`${API_BASE_URL}/missing-persons/`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                // API List response: [{ id, full_name, age, gender, reporter_email, last_seen_location, state, district, disaster_type, created_at, has_identity_card, has_person_photo }]
                // Map to format needed for Autocomplete options { label: "Name (ID)", id: id }
                const options = data.map(person => ({
                    label: `${person.full_name} (${person.id})`,
                    id: person.id
                 }));
                setReportList(options);
            } catch (error) {
                console.error("Error fetching report list:", error);
                setError("Failed to load report list. Please try refreshing.");
            } finally {
                setLoadingList(false);
            }
        };
        fetchReportList();
    }, []);

    // Fetch full details when a person is selected from Autocomplete
    const handleSearch = async (selectedOption) => {
        // selectedOption is now { label: "Name (ID)", id: id } or null
        if (!selectedOption || !selectedOption.id) {
            setSelectedPerson(null); // Clear selection if input is cleared or no ID
            setError('');
            return;
        }

        const personId = selectedOption.id;
        setLoadingDetails(true);
        setSelectedPerson(null); // Clear previous selection while loading
        setError('');
        setSuccessMessage('');

        try {
            const response = await fetch(`${API_BASE_URL}/missing-persons/${personId}/`);
            if (!response.ok) {
                 if (response.status === 404) throw new Error(`Report with ID ${personId} not found.`);
                 throw new Error(`HTTP error! status: ${response.status}`);
            }
            const detailedData = await response.json();
            // Detailed data includes: id, reporter{...}, full_name, age, gender, description, ... , identity_card_image, person_photo
            const mappedData = mapApiResponseToSelectedPerson(detailedData);
            setSelectedPerson(mappedData);
            setEditedInfo({ additionalInfo: mappedData?.additionalInfo || "" }); // Set editor with current info
        } catch (error) {
            console.error("Error fetching person details:", error);
            setError(`Failed to load details: ${error.message}`);
            setSelectedPerson(null);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleEditChange = (e) => {
        setEditedInfo({ ...editedInfo, [e.target.name]: e.target.value });
    };

    // Generic update function using PATCH
    const updateReportInfo = async (reportId, payload) => {
        if (!reportId) return;
        setLoadingUpdate(true);
        setError('');
        setSuccessMessage('');
        try {
            const response = await fetch(`${API_BASE_URL}/missing-persons/${reportId}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                 const errorData = await response.json().catch(() => ({}));
                 const errorDetail = errorData.detail || JSON.stringify(errorData) || `HTTP error ${response.status}`;
                 throw new Error(errorDetail);
            }
            const updatedData = await response.json();
            const mappedData = mapApiResponseToSelectedPerson(updatedData);
            setSelectedPerson(mappedData); // Update displayed details with response
            setEditedInfo({ additionalInfo: mappedData?.additionalInfo || "" }); // Reset edit field with saved data
            setSuccessMessage("Report updated successfully!");
            // Update the main list data source if necessary (optional, increases complexity)
            // setReportList(prevList => /* logic to update the specific item in the list */);

        } catch (error) {
            console.error("Error updating report:", error);
            setError(`Update failed: ${error.message}`);
        } finally {
            setLoadingUpdate(false);
            setTimeout(() => setSuccessMessage(''), 3000); // Clear success message
        }
    };

    const handleSaveChanges = () => {
        if (!selectedPerson) return;
        updateReportInfo(selectedPerson.id, {
            additional_info: editedInfo.additionalInfo
        });
    };

    const handleMarkFound = () => {
        if (!selectedPerson || selectedPerson.isMarkedFound) return; // Prevent marking again if already marked

        // Prepend "[FOUND]" only if it's not already there. Use original info if possible.
        const currentInfo = selectedPerson.additionalInfo || "";
        const newAdditionalInfo = `[FOUND] ${currentInfo}`;

        updateReportInfo(selectedPerson.id, {
            additional_info: newAdditionalInfo
        });
    };

    return (
        <Box
            sx={{
                position: "absolute", top: 0, left: 0, right: 0, minHeight: "100vh",
                background: `linear-gradient(rgba(255, 255, 255, 0.90), rgba(255, 255, 255, 0.90)), url(${worldMapBackground})`,
                backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed",
                backgroundRepeat: "repeat-y", margin: 0, padding: 0, zIndex: 0,
            }}
        >
            <Container maxWidth="md" sx={{ mt: 8, pb: 4, pt: 8 }}> {/* Added top padding */}
                {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
                {successMessage && <Alert severity="success" onClose={() => setSuccessMessage('')} sx={{ mb: 2 }}>{successMessage}</Alert>}

                <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
                    <Autocomplete
                        id="person-search-input"
                        options={reportList} // Use fetched list
                        getOptionLabel={(option) => option.label || ""} // Display "Name (ID)"
                        isOptionEqualToValue={(option, value) => option.id === value.id} // Compare by ID
                        loading={loadingList}
                        value={reportList.find(p => p.id === selectedPerson?.id) || null} // Control selected value
                        onChange={(event, newValue) => {
                            // newValue is the selected { label, id } object or null
                            handleSearch(newValue);
                        }}
                        sx={{ width: { xs: '90%', sm: 500, md: 600 } }} // Responsive width
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Search by Name or ID"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {loadingList ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        backgroundColor: "white",
                                        borderRadius: '8px', // Softer corners
                                        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
                                        "& fieldset": { borderColor: "transparent" },
                                        "&:hover fieldset": { borderColor: "rgba(0, 0, 0, 0.1)" }, // Slight border on hover
                                        "&.Mui-focused fieldset": { borderColor: "primary.main", borderWidth: '1px' }, // Standard focus
                                    },
                                }}
                            />
                        )}
                    />
                </Box>

                {loadingDetails && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}

                {!loadingDetails && selectedPerson && (
                    <Card sx={{
                        maxWidth: 600, // Limit card width
                        mx: "auto", p: 3, mt: 0, borderRadius: 2,
                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                    }}>
                        <Typography variant="h6" align="center" gutterBottom>
                            Missing Person Details (ID: {selectedPerson.id})
                        </Typography>

                        <Box sx={{ display: "flex", flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', mt: 2, gap: { xs: 2, sm: 3 } }}>
                            <Avatar
                                src={selectedPerson.photo || undefined} // Use undefined if null to show default avatar
                                sx={{ width: 100, height: 100, alignSelf: 'center' }}
                            />
                            <Box sx={{ textAlign: { xs: 'center', sm: 'left' }}}>
                                <Typography variant="body1"><strong>Name:</strong> {selectedPerson.name}</Typography>
                                <Typography variant="body1"><strong>Age:</strong> {selectedPerson.age}</Typography>
                                <Typography variant="body1"><strong>Gender:</strong> {selectedPerson.gender}</Typography>
                                <Typography variant="body1"><strong>Disaster Context:</strong> {selectedPerson.disasterType}</Typography>
                                <Typography variant="body1"><strong>Last Seen:</strong> {selectedPerson.lastSeen}</Typography>
                                <Typography variant="body1"><strong>Reporter Contact:</strong> {selectedPerson.contactInfo}</Typography>
                                <Typography variant="body1"><strong>Description:</strong> {selectedPerson.description}</Typography>
                            </Box>
                        </Box>

                        <Box sx={{ mt: 3 }}>
                             <Typography variant="body1" sx={{mb: 1}}><strong>Status:</strong> {selectedPerson.status}</Typography>
                            <TextField
                                fullWidth
                                variant="outlined" // Changed to outlined for better visibility
                                margin="normal"
                                label="Update Additional Information"
                                name="additionalInfo"
                                multiline
                                rows={3}
                                value={editedInfo.additionalInfo}
                                onChange={handleEditChange}
                                InputLabelProps={{ shrink: true }} // Keep label floated
                            />
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, flexWrap: 'wrap', gap: 1 }}>
                            <Button variant="contained" color="primary" onClick={handleSaveChanges} disabled={loadingUpdate}>
                                {loadingUpdate ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
                            </Button>
                            {!selectedPerson.isMarkedFound && ( // Use flag derived from mapping
                                <Button variant="contained" color="success" onClick={handleMarkFound} disabled={loadingUpdate}>
                                    {loadingUpdate ? <CircularProgress size={24} color="inherit" /> : "Mark as Found"}
                                </Button>
                            )}
                        </Box>
                    </Card>
                )}
            </Container>
        </Box>
    );
};

export default StatusTracking;