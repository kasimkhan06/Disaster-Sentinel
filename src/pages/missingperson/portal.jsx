import React, { useState, useEffect, useCallback } from "react";
import Grid from "@mui/material/Grid2"; // MUI Grid v2
import { Container, Typography, Box, Alert, Card, CircularProgress } from "@mui/material";
import worldMapBackground from "/assets/background_image/world-map-background.jpg";
import MissingPersonForm from '../missingperson/form';
import InteractiveMap from '../../components/InteractiveMap';

const API_BASE_URL = "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com";
const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/doxgltggk/";

const MissingPersonPortal = () => {
    const initialFormData = {
        name: "", age: "", gender: "", description: "", identificationMarks: "",
        lastSeen: null, lastSeenPlace: "", state: "", district: "",
        contactInfo: "", additional_info: "",
        disasterType: "",
        idCard: null, photo: null,
    };

    const [formData, setFormData] = useState(initialFormData);
    const [selectedState, setSelectedState] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [errors, setErrors] = useState({});
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    const [captchaToken, setCaptchaToken] = useState(null);
    const [imagePreviews, setImagePreviews] = useState({ photo: null, idCard: null });
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const photoPreviewUrl = imagePreviews.photo;
        const idCardPreviewUrl = imagePreviews.idCard;
        return () => {
            if (photoPreviewUrl && typeof photoPreviewUrl === 'string' && photoPreviewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(photoPreviewUrl);
            }
            if (idCardPreviewUrl && typeof idCardPreviewUrl === 'string' && idCardPreviewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(idCardPreviewUrl);
            }
        };
    }, [imagePreviews.photo, imagePreviews.idCard]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
            if (errors.state || errors.district || errors.disasterType) {
                setErrors(prev => ({ ...prev, state: undefined, district: undefined, disasterType: undefined }));
            }
        } else if (name === 'district') {
            setSelectedDistrict(value ? { district: value } : null);
            setFormData(prev => ({ ...prev, district: value }));
            if (errors.district) {
                setErrors(prev => ({ ...prev, district: undefined }));
            }
        }
        if (name === 'disasterType' && errors.disasterType) {
            setErrors(prev => ({ ...prev, disasterType: undefined }));
        }
        if (name === 'contactInfo' && errors.contactInfo) {
            setErrors(prev => ({ ...prev, contactInfo: undefined }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const fieldName = e.target.name;
        const newValidationErrors = { ...errors };

        const resetFileState = () => {
            setFormData((prevData) => ({ ...prevData, [fieldName]: null }));
            if (imagePreviews[fieldName] && typeof imagePreviews[fieldName] === 'string' && imagePreviews[fieldName].startsWith('blob:')) {
                URL.revokeObjectURL(imagePreviews[fieldName]);
            }
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
        const allowedTypes = ["jpeg", "jpg", "png"];
        const maxSizeInBytes = 5 * 1024 * 1024; // 5MB

        let fileIsValid = true;
        if (!allowedTypes.includes(fileExtension)) {
            newValidationErrors[fieldName] = "Invalid file type! Only JPEG, JPG, or PNG allowed.";
            fileIsValid = false;
        } else if (file.size > maxSizeInBytes) {
            newValidationErrors[fieldName] = `File too large! Max size is 5MB.`;
            fileIsValid = false;
        }

        if (!fileIsValid) {
            resetFileState();
        } else {
            if (imagePreviews[fieldName] && typeof imagePreviews[fieldName] === 'string' && imagePreviews[fieldName].startsWith('blob:')) {
                URL.revokeObjectURL(imagePreviews[fieldName]);
            }
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

        if (!formData.name.trim()) validationErrors.name = "Name is required.";
        if (!formData.age) validationErrors.age = "Age is required.";
        else if (isNaN(formData.age) || Number(formData.age) <= 0) validationErrors.age = "Invalid age.";
        if (!formData.gender) validationErrors.gender = "Gender is required.";
        if (!formData.description.trim()) validationErrors.description = "Description is required.";
        if (!formData.lastSeenPlace.trim()) validationErrors.location = "Last seen location text is required.";
        if (!formData.lastSeen) validationErrors.location = (validationErrors.location || "") + " Please validate the location using search or map click to get coordinates.";
        if (!formData.state) validationErrors.state = "State is required.";
        if (formData.state && !formData.district) validationErrors.district = "District is required.";
        if (!formData.disasterType) validationErrors.disasterType = "Disaster type is required.";
        if (!formData.contactInfo.trim()) validationErrors.contactInfo = "Contact information for updates is required.";
        
        if (!formData.photo) {
            if (!imagePreviews.photo || !imagePreviews.photo.startsWith(CLOUDINARY_BASE_URL)) {
                validationErrors.photo = "Person's photo (JPEG/PNG) is required.";
            }
        }
        if (errors.photo && !validationErrors.photo) validationErrors.photo = errors.photo;
        if (errors.idCard && !validationErrors.idCard) validationErrors.idCard = errors.idCard;

        if (!captchaToken) validationErrors.captcha = "Please complete the reCAPTCHA verification.";

        let reporterId = null;
        try {
            const userDataString = localStorage.getItem('user');
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                reporterId = userData?.user_id;
            }
            if (!reporterId) {
                validationErrors.reporter = "User ID not found. Please log in again.";
                setStatusMessage({ type: 'error', text: 'User information missing. Please log in again.' });
            } else {
                if (validationErrors.reporter) validationErrors.reporter = undefined;
            }
        } catch (parseError) {
            console.error("Error parsing user data from localStorage:", parseError);
            validationErrors.reporter = "Failed to read user data. Please log in again.";
            setStatusMessage({ type: 'error', text: 'Failed to read user information. Please log in again.' });
            reporterId = null;
        }

        setErrors(validationErrors);
        const hasErrors = Object.values(validationErrors).some(error => !!error);

        if (hasErrors || !reporterId) {
            if (!statusMessage.text && !validationErrors.reporter) {
                setStatusMessage({ type: 'error', text: 'Please fix the errors highlighted in the form.' });
            }
            return;
        }

        setIsSubmitting(true);
        setStatusMessage({ type: 'info', text: 'Submitting report...' });

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
        if (formData.disasterType) apiFormData.append('disasterType', formData.disasterType);
        apiFormData.append('contactInfo', formData.contactInfo);
        if (formData.additional_info) apiFormData.append('additional_info', formData.additional_info);
        
        if (formData.idCard instanceof File) {
            apiFormData.append('idCard', formData.idCard, formData.idCard.name);
        }
        if (formData.photo instanceof File) {
            apiFormData.append('photo', formData.photo, formData.photo.name);
        }

        console.log("Submitting the following FormData to backend:");
        for (let [key, value] of apiFormData.entries()) {
            if (value instanceof File) {
                console.log(`${key}: File - Name: ${value.name}, Size: ${value.size}, Type: ${value.type}`);
            } else {
                console.log(`${key}: ${value}`);
            }
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/missing-persons/`, {
                method: 'POST',
                body: apiFormData,
            });

            const responseData = await response.json();

            if (!response.ok) {
                let errorString = `HTTP error ${response.status}`;
                if (typeof responseData === 'object' && responseData !== null) {
                    errorString = Object.entries(responseData)
                        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                        .join('; ');
                } else if (responseData.detail) {
                    errorString = responseData.detail;
                }
                throw new Error(errorString);
            }

            setStatusMessage({ type: 'success', text: 'Report submitted successfully!' });
            setErrors({});
            setFormData(initialFormData);
            setSelectedState(null);
            setSelectedDistrict(null);
            setCaptchaToken(null);

            const reportData = responseData.report || responseData;
            const newPhotoPreview = reportData.person_photo
                ? `${CLOUDINARY_BASE_URL}${reportData.person_photo}`
                : null;
            const newIdCardPreview = reportData.id_card_photo
                ? `${CLOUDINARY_BASE_URL}${reportData.id_card_photo}`
                : null;

            setImagePreviews({
                photo: newPhotoPreview,
                idCard: newIdCardPreview
            });
            
            setTimeout(() => setStatusMessage({ type: '', text: '' }), 7000);

        } catch (error) {
            console.error("Form Submission API Error:", error);
            setStatusMessage({ type: 'error', text: `Submission failed: ${error.message}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box
            sx={{
                position: "absolute", top: 0, left: 0, right: 0,
                minHeight: "100vh",
                background: `linear-gradient(rgba(255, 255, 255, 0.90), rgba(255, 255, 255, 0.90)), url(${worldMapBackground})`,
                backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed",
                backgroundRepeat: "repeat-y", margin: 0, padding: 0, zIndex: 0,
                display: 'flex', // Added for centering the container if needed, or managing overall page flow
                flexDirection: 'column', // Ensures children stack vertically
                alignItems: 'center', // Centers the container horizontally
            }}
        >
            <Container 
                sx={{ 
                    pt: { xs: 10, md: 12 },
                    pb: 4, 
                    position: "relative",
                    width: '100%', // Ensure container takes available width
                }}
            >
                {/* <Typography align="center" sx={{ mt: 1, mb: 3, fontSize: { xs: "1.1rem", sm: "1.3rem", md: "1.5rem" }, fontWeight: "500" }}>
                    Report a Missing Person
                </Typography> */}

                {statusMessage.text && (
                    <Alert
                        severity={statusMessage.type || 'info'}
                        onClose={() => setStatusMessage({ type: '', text: '' })}
                        sx={{ mb: 2, width: '100%', maxWidth: {xs: '90%', md: '800px'}, mx: 'auto' }} // Make alert responsive
                    >
                        {statusMessage.text}
                    </Alert>
                )}

                {/* Main Grid Layout: Using a single Card to contain both form and map for a unified look */}
                <Card sx={{ 
                    p: { xs: 2, md: 3 }, // Responsive padding for the main card
                    borderRadius: 3, 
                    boxShadow: 3, // A bit more shadow for the main container card
                    display: 'flex', // Use flex to manage children
                    flexDirection: { xs: 'column', md: 'row' }, // Stack on small screens, row on medium+
                    gap: { xs: 3, md: 4 }, // Gap between form and map sections
                    width: '100%', // Card takes full width of its container
                    mx: 'auto', // Center the card if container is wider
                   // maxWidth: '1400px' // Optional: Max width for the entire content card
                }}>
                    {/* Form Grid Item (Now a Box within the flex Card) */}
                    <Box sx={{ 
                        flex: { md: 1 }, // Takes 1 part of flex space on medium screens and up
                        width: { xs: '100%', md: 'auto' }, // Full width on small, auto on medium+
                        display: 'flex',
                        flexDirection: 'column' 
                    }}>
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
                    </Box>

                    {/* Map and Image Previews Grid Item (Now a Box within the flex Card) */}
                    <Box sx={{ 
                        flex: { md: 1 }, // Takes 1 part of flex space on medium screens and up
                        width: { xs: '100%', md: 'auto' }, // Full width on small, auto on medium+
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 2,
                        minHeight: {xs: 'auto', md: '500px'} // Ensure this section has some min height on larger screens
                                                            // Adjust this value based on your map's typical content height
                    }}>
                        <Typography align="center" sx={{ fontSize: { xs: "1rem", sm: "1.2rem" }, fontWeight: "500" }}>
                            Last Seen Location Map
                        </Typography>
                        <Box sx={{ flexGrow: 1, width: '100%', minHeight: {xs: '300px', md: '400px'}, // Ensure map has space
                                   backgroundColor: '#f0f0f0', // Placeholder background
                                   borderRadius: 2,
                                   overflow: 'hidden' // Important for map if it has its own scroll/zoom
                                   }}>
                             <InteractiveMap
                                formData={formData}
                                setFormData={setFormData}
                                setError={(mapError) => setStatusMessage({ type: 'error', text: mapError })}
                                // It's crucial that InteractiveMap is styled to fill this Box.
                                // e.g., its root element should have height: '100%', width: '100%'
                            />
                        </Box>


                        {(imagePreviews.photo || imagePreviews.idCard) && (
                            <Box sx={{ mt: 2 }}>
                                <Typography align="center" sx={{ fontSize: { xs: "1rem", sm: "1.1rem" }, fontWeight: "500", mb: 1 }}>
                                    Uploaded Images Preview
                                </Typography>
                                <Grid container spacing={2} justifyContent="center">
                                    {imagePreviews.photo && (
                                        <Grid item xs={12} sm={imagePreviews.idCard ? 6 : 12}>
                                            <img
                                                src={imagePreviews.photo}
                                                alt="Uploaded Photo Preview"
                                                style={{ width: "100%", borderRadius: 8, border: '1px solid #eee', maxHeight: '150px', objectFit: 'contain' }} // Reduced max height
                                            />
                                            <Typography align="center" variant="caption" display="block" sx={{ mt: 0.5 }}>Photo Preview</Typography>
                                        </Grid>
                                    )}
                                    {imagePreviews.idCard && (
                                        <Grid item xs={12} sm={imagePreviews.photo ? 6 : 12}>
                                            <img
                                                src={imagePreviews.idCard}
                                                alt="Uploaded ID Card Preview"
                                                style={{ width: "100%", borderRadius: 8, border: '1px solid #eee', maxHeight: '150px', objectFit: 'contain' }} // Reduced max height
                                            />
                                            <Typography align="center" variant="caption" display="block" sx={{ mt: 0.5 }}>ID Card Preview</Typography>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>
                        )}
                    </Box>
                </Card>
            </Container>

            {isSubmitting && (
                <Box sx={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    justifyContent: 'center', alignItems: 'center', zIndex: 2000
                }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2, color: 'white' }}>Submitting report...</Typography>
                </Box>
            )}
        </Box>
    );
};

export default MissingPersonPortal;