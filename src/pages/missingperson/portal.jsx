import React, { useState, useEffect, useCallback } from "react";
import Grid from "@mui/material/Grid2"; // MUI Grid v2
import { Container, Typography, Box, Alert, Card, CircularProgress } from "@mui/material";
import worldMapBackground from "/assets/background_image/world-map-background.jpg";
import MissingPersonForm from '../missingperson/form'; // Adjust path
import InteractiveMap from '../../components/InteractiveMap';   // Adjust path

const API_BASE_URL = "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com";

const MissingPersonPortal = () => {
    const [formData, setFormData] = useState({
        name: "", age: "", gender: "", description: "", identificationMarks: "",
        lastSeen: null, lastSeenPlace: "", state: "", district: "",
        contactInfo: "", additionalInfo: "",
        disasterType: "", 
        idCard: null, photo: null,
    });

    const [selectedState, setSelectedState] = useState(null); // Can store object like { state: 'Maharashtra' } or just the string
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [errors, setErrors] = useState({});
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    const [captchaToken, setCaptchaToken] = useState(null);
    const [imagePreviews, setImagePreviews] = useState({ photo: null, idCard: null });
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Cleanup Object URLs
    useEffect(() => {
        return () => {
            if (imagePreviews.photo) URL.revokeObjectURL(imagePreviews.photo);
            if (imagePreviews.idCard) URL.revokeObjectURL(imagePreviews.idCard);
        };
    }, [imagePreviews.photo, imagePreviews.idCard]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear specific errors on interaction
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
        if (name === 'lastSeenPlace' && errors.location) {
            setErrors(prev => ({ ...prev, location: undefined }));
        }
        if (name === 'state') {
             setSelectedState(value ? { state: value } : null);
             setSelectedDistrict(null);
             setFormData(prev => ({ ...prev, state: value, district: '' }));
             // Clear downstream errors when state changes
             if (errors.state || errors.district || errors.disasterType) setErrors(prev => ({ ...prev, state: undefined, district: undefined, disasterType: undefined }));
        } else if (name === 'district') {
             setSelectedDistrict(value ? { district: value } : null);
             setFormData(prev => ({ ...prev, district: value }));
             if (errors.district) setErrors(prev => ({ ...prev, district: undefined }));
        }
         // Clear disasterType error if selection changes (now stores code)
        if (name === 'disasterType' && errors.disasterType) {
            setErrors(prev => ({ ...prev, disasterType: undefined }));
        }
        if (name === 'contactInfo' && errors.contactInfo) {
             setErrors(prev => ({ ...prev, contactInfo: undefined }));
        }
    };

    const handleFileChange = (e) => {
        // ... (file change logic remains the same) ...
        const file = e.target.files[0];
        const fieldName = e.target.name;
        const newValidationErrors = { ...errors };

        const resetFileState = () => {
            setFormData((prevData) => ({ ...prevData, [fieldName]: null }));
            if (imagePreviews[fieldName]) URL.revokeObjectURL(imagePreviews[fieldName]);
            setImagePreviews((prevPreviews) => ({ ...prevPreviews, [fieldName]: null }));
            if (e.target) e.target.value = null;
        };

        newValidationErrors[fieldName] = undefined;

        if (!file) {
            resetFileState();
            setErrors(newValidationErrors);
            return;
        }

        const fileNameStr = file.name.toLowerCase();
        const fileExtension = fileNameStr.split(".").pop();
        const allowedTypes = ["jpeg"];
        const maxSizeInBytes = 5 * 1024 * 1024;

        let fileIsValid = true;
        if (!allowedTypes.includes(fileExtension)) {
            newValidationErrors[fieldName] = "Invalid file type! Only JPEG allowed.";
            fileIsValid = false;
        } else if (file.size > maxSizeInBytes) {
            newValidationErrors[fieldName] = `File too large! Max size is 5MB.`;
            fileIsValid = false;
        }

        if (!fileIsValid) {
            resetFileState();
        } else {
            if (imagePreviews[fieldName]) URL.revokeObjectURL(imagePreviews[fieldName]);
            const fileUrl = URL.createObjectURL(file);
            setFormData((prevData) => ({ ...prevData, [fieldName]: file }));
            setImagePreviews((prevPreviews) => ({ ...prevPreviews, [fieldName]: fileUrl }));
        }
        setErrors(newValidationErrors);
    };

    const handleCaptchaVerify = (token) => {
        setCaptchaToken(token);
        if (errors.captcha) setErrors(prev => ({ ...prev, captcha: undefined }));
        setStatusMessage({ type: '', text: '' });
    };

    const searchMapLocation = useCallback(async () => {
        // ... (searchMapLocation logic remains the same) ...
        const query = formData.lastSeenPlace?.trim();
        if (!query) {
            setStatusMessage({ type: 'error', text: 'Please enter a location to search.' });
            return;
        }
        if (errors.location) {
            setErrors(prev => ({ ...prev, location: undefined }));
        }
        setIsSearchingLocation(true);
        setStatusMessage({ type: 'info', text: `Searching for "${query}"...` });
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Nominatim HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const coordinates = [parseFloat(lat), parseFloat(lon)];
                setFormData(prev => ({
                    ...prev,
                    lastSeen: coordinates,
                    lastSeenPlace: display_name
                }));
                setStatusMessage({ type: 'success', text: `Location found: ${display_name}` });
                setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000);
            } else {
                setStatusMessage({ type: 'error', text: `Location "${query}" not found. Please try again or use the map.` });
                setFormData(prev => ({ ...prev, lastSeen: null }));
            }
        } catch (error) {
            console.error("Error fetching location data from Nominatim:", error);
            setStatusMessage({ type: 'error', text: "Failed to search for location. Check connection or try again." });
            setFormData(prev => ({ ...prev, lastSeen: null }));
        } finally {
            setIsSearchingLocation(false);
        }
    }, [formData.lastSeenPlace, errors.location]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMessage({ type: '', text: '' });
        let validationErrors = { ...errors };

        // --- Validation Checks (remain mostly the same) ---
        if (!formData.name.trim()) validationErrors.name = "Name is required.";
        if (!formData.age) validationErrors.age = "Age is required.";
        else if (isNaN(formData.age) || Number(formData.age) <= 0) validationErrors.age = "Invalid age.";
        if (!formData.gender) validationErrors.gender = "Gender is required.";
        if (!formData.description.trim()) validationErrors.description = "Description is required.";
        if (!formData.lastSeenPlace.trim()) validationErrors.location = "Last seen location text is required.";
        if (!formData.lastSeen) validationErrors.location = "Please validate the location using search or map click to get coordinates.";
        if (!formData.state) validationErrors.state = "State is required.";
        if (formData.state && !formData.district) validationErrors.district = "District is required.";
        if (!formData.disasterType) validationErrors.disasterType = "Disaster type code is required."; // Now expects code
        if (!formData.contactInfo.trim()) validationErrors.contactInfo = "Contact information for updates is required.";
        if (!formData.photo) validationErrors.photo = "Person's photo (JPEG) is required.";
        if (errors.photo && !validationErrors.photo) validationErrors.photo = errors.photo;
        if (errors.idCard && !validationErrors.idCard) validationErrors.idCard = errors.idCard;
        if (!captchaToken) validationErrors.captcha = "Please complete the reCAPTCHA verification.";

        // --- Get Reporter ID ---
        let reporterId = null;
        try {
            const userDataString = localStorage.getItem('user');
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                reporterId = userData?.user_id;
            }
            if (!reporterId) {
                validationErrors.reporter = "User ID not found in stored data. Please log in again.";
                setStatusMessage({ type: 'error', text: 'Cannot submit report. User information is missing or invalid. Please log in again.' });
            } else {
                 if (validationErrors.reporter) validationErrors.reporter = undefined;
            }
        } catch (parseError) {
            console.error("Error parsing user data from localStorage:", parseError);
            validationErrors.reporter = "Failed to read user data. Please log in again.";
            setStatusMessage({ type: 'error', text: 'Cannot submit report. Failed to read user information. Please log in again.' });
            reporterId = null;
        }

        setErrors(validationErrors);
        const hasErrors = Object.values(validationErrors).some(error => !!error);

        if (hasErrors || !reporterId) {
             if (!statusMessage.text) {
                 setStatusMessage({ type: 'error', text: 'Please fix the errors highlighted in the form.' });
             }
            return;
        }

        setIsSubmitting(true);
        setStatusMessage({ type: 'info', text: 'Submitting report...' });

        // --- Construct FormData for API ---
        const apiFormData = new FormData();
        apiFormData.append('reporter_id', reporterId);
        apiFormData.append('name', formData.name);
        if (formData.age) apiFormData.append('age', formData.age);
        if (formData.gender) apiFormData.append('gender', formData.gender);
        apiFormData.append('description', formData.description);
        if (formData.identificationMarks) apiFormData.append('identificationMarks', formData.identificationMarks);
        apiFormData.append('lastSeenPlace', formData.lastSeenPlace);
        if (formData.lastSeen && formData.lastSeen.length === 2) {
            apiFormData.append('latitude', formData.lastSeen[0]);
            apiFormData.append('longitude', formData.lastSeen[1]);
        }
        if (formData.state) apiFormData.append('state', formData.state);
        if (formData.district) apiFormData.append('district', formData.district);
        // Use the correct key 'disasterType' and send the CODE stored in formData.disasterType
        if (formData.disasterType) apiFormData.append('disasterType', formData.disasterType);
        // Use the correct key 'contactinfo'
        apiFormData.append('contactInfo', formData.contactInfo);
        if (formData.additionalInfo) apiFormData.append('additionalInfo', formData.additionalInfo);
        if (formData.idCard) apiFormData.append('idCard', formData.idCard, formData.idCard.name);
        if (formData.photo) apiFormData.append('photo', formData.photo, formData.photo.name);

        // API Call
        try {
            const response = await fetch(`${API_BASE_URL}/api/missing-persons/`, {
                method: 'POST',
                body: apiFormData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                 // Try to format backend validation errors
                 let errorString = `HTTP error ${response.status}`;
                 if (typeof errorData === 'object' && errorData !== null) {
                     errorString = Object.entries(errorData)
                         .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                         .join('; ');
                 } else if (errorData.detail) {
                    errorString = errorData.detail;
                 }
                throw new Error(errorString);
            }

            setStatusMessage({ type: 'success', text: 'Report submitted successfully!' });
            setErrors({});
            // Reset form
            setFormData({
                name: "", age: "", gender: "", description: "", identificationMarks: "",
                lastSeen: null, lastSeenPlace: "", state: "", district: "",
                contactInfo: "", additionalInfo: "", disasterType: "",
                idCard: null, photo: null,
            });
            setSelectedState(null); setSelectedDistrict(null);
            if (imagePreviews.photo) URL.revokeObjectURL(imagePreviews.photo);
            if (imagePreviews.idCard) URL.revokeObjectURL(imagePreviews.idCard);
            setImagePreviews({ photo: null, idCard: null });
            setCaptchaToken(null);
            
            setTimeout(() => setStatusMessage({ type: '', text: '' }), 5000);

        } catch (error) {
            console.error("Form Submission API Error:", error);
            // Display the formatted error message from the backend
            setStatusMessage({ type: 'error', text: `Submission failed: ${error.message}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        // --- JSX Structure remains the same as the previous version ---
        <Box
            sx={{
                position: "absolute", top: 0, left: 0, right: 0,
                minHeight: "100vh", background: `linear-gradient(rgba(255, 255, 255, 0.90), rgba(255, 255, 255, 0.90)),
                url(${worldMapBackground})`,
                backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed",
                backgroundRepeat: "repeat-y", margin: 0, padding: 0, zIndex: 0,
            }}
        >
            <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 8 }, pb: 4, position: "relative" }}>
                <Typography align="center" sx={{ mt: 1, mb: 3, fontSize: { xs: "1.1rem", sm: "1.3rem", md: "1.5rem" }, fontWeight: "500" }}>
                    Report a Missing Person
                </Typography>

                {statusMessage.text && (
                    <Alert severity={statusMessage.type || 'info'} onClose={() => setStatusMessage({type:'', text:''})} sx={{ mb: 2, width: '100%', maxWidth: '800px', mx: 'auto' }}>
                        {statusMessage.text}
                    </Alert>
                )}

                <Grid container spacing={4} sx={{ display: "flex", justifyContent: "center" }}>
                    <Grid item xs={12} md={6}>
                        <MissingPersonForm
                            formData={formData}
                            setFormData={setFormData}
                            handleInputChange={handleInputChange}
                            handleFileChange={handleFileChange}
                            handleSubmit={handleSubmit}
                            errors={errors}
                            handleCaptchaVerify={handleCaptchaVerify}
                            selectedState={selectedState}
                            setSelectedState={setSelectedState}
                            selectedDistrict={selectedDistrict}
                            setSelectedDistrict={setSelectedDistrict}
                            searchMapLocation={searchMapLocation}
                            isSearchingLocation={isSearchingLocation}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                         <Card sx={{ p: 3, borderRadius: 3, boxShadow: 0, display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
                            <Typography align="center" sx={{ fontSize: { xs: "1rem", sm: "1.2rem" }, fontWeight: "500", mb: 0 }}>
                                Last Seen Location Map
                            </Typography>
                            <InteractiveMap
                                formData={formData}
                                setFormData={setFormData}
                                setError={(mapError) => setStatusMessage({ type: 'error', text: mapError })}
                            />

                            {(imagePreviews.photo || imagePreviews.idCard) && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography align="center" sx={{ fontSize: { xs: "1rem", sm: "1.2rem" }, fontWeight: "500", mb: 1 }}>
                                        Uploaded Images Preview
                                    </Typography>
                                    <Grid container spacing={2} justifyContent="center">
                                        {imagePreviews.photo && (
                                            <Grid item xs={12} sm={imagePreviews.idCard ? 6 : 12}>
                                                <img src={imagePreviews.photo} alt="Uploaded Photo Preview" style={{ width: "100%", borderRadius: 8, border: '1px solid #eee', maxHeight: '200px', objectFit: 'contain' }} />
                                                <Typography align="center" variant="caption" display="block" sx={{ mt: 0.5 }}>Photo Preview</Typography>
                                            </Grid>
                                        )}
                                        {imagePreviews.idCard && (
                                            <Grid item xs={12} sm={imagePreviews.photo ? 6 : 12}>
                                                <img src={imagePreviews.idCard} alt="Uploaded ID Card Preview" style={{ width: "100%", borderRadius: 8, border: '1px solid #eee', maxHeight: '200px', objectFit: 'contain' }} />
                                                <Typography align="center" variant="caption" display="block" sx={{ mt: 0.5 }}>ID Card Preview</Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Box>
                            )}
                        </Card>
                    </Grid>
                </Grid>
            </Container>
            {isSubmitting && (
                <Box sx={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000}}>
                    <CircularProgress />
                    <Typography sx={{ml: 2, color: 'white'}}>Submitting report...</Typography>
                </Box>
            )}
        </Box>
    );
};

export default MissingPersonPortal;