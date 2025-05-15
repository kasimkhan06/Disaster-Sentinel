import React, { useState, useEffect, useCallback } from "react";
import Grid from "@mui/material/Grid2"; // MUI Grid v2
import { Container, Typography, Box, Alert, Card, CircularProgress } from "@mui/material";
import worldMapBackground from "/assets/background_image/world-map-background.jpg"; // Ensure this path is correct for your project setup
import MissingPersonForm from '../missingperson/form'; // Adjust path as per your project structure
import InteractiveMap from '../../components/InteractiveMap';  // Adjust path as per your project structure

const API_BASE_URL = "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com";
const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/doxgltggk/";

const MissingPersonPortal = () => {
    // Initial state for the form data
    const initialFormData = {
        name: "", age: "", gender: "", description: "", identificationMarks: "",
        lastSeen: null, lastSeenPlace: "", state: "", district: "",
        contactInfo: "", additional_info: "",
        disasterType: "",
        idCard: null, photo: null, // These will hold File objects for new uploads
    };

    // State hooks for managing form data, selections, errors, and UI status
    const [formData, setFormData] = useState(initialFormData);
    const [selectedState, setSelectedState] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [errors, setErrors] = useState({});
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    const [captchaToken, setCaptchaToken] = useState(null);
    const [imagePreviews, setImagePreviews] = useState({ photo: null, idCard: null }); // Holds URLs for previews (blob or Cloudinary)
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Effect to clean up blob URLs created for image previews
    useEffect(() => {
        const photoPreviewUrl = imagePreviews.photo;
        const idCardPreviewUrl = imagePreviews.idCard;

        return () => {
            // Only revoke if it's a blob URL (created by URL.createObjectURL)
            if (photoPreviewUrl && typeof photoPreviewUrl === 'string' && photoPreviewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(photoPreviewUrl);
            }
            if (idCardPreviewUrl && typeof idCardPreviewUrl === 'string' && idCardPreviewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(idCardPreviewUrl);
            }
        };
    }, [imagePreviews.photo, imagePreviews.idCard]); // Rerun if the preview URLs change

    // Handles changes in text inputs and select fields
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
        // Special handling for state and district changes
        if (name === 'state') {
            setSelectedState(value ? { state: value } : null);
            setSelectedDistrict(null); // Reset district when state changes
            setFormData(prev => ({ ...prev, state: value, district: '' })); // Update form data and clear district
            // Clear downstream errors when state changes
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
        // Clear disasterType error if selection changes
        if (name === 'disasterType' && errors.disasterType) {
            setErrors(prev => ({ ...prev, disasterType: undefined }));
        }
        // Clear contactInfo error if it changes
        if (name === 'contactInfo' && errors.contactInfo) {
            setErrors(prev => ({ ...prev, contactInfo: undefined }));
        }
    };

    // Handles file input changes for photo and ID card
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const fieldName = e.target.name; // 'photo' or 'idCard'
        const newValidationErrors = { ...errors };

        // Function to reset file state for a given field
        const resetFileState = () => {
            setFormData((prevData) => ({ ...prevData, [fieldName]: null }));
            // If there was an old preview for this field, revoke it before setting to null
            if (imagePreviews[fieldName] && typeof imagePreviews[fieldName] === 'string' && imagePreviews[fieldName].startsWith('blob:')) {
                URL.revokeObjectURL(imagePreviews[fieldName]);
            }
            setImagePreviews((prevPreviews) => ({ ...prevPreviews, [fieldName]: null }));
            if (e.target) e.target.value = null; // Reset the file input element
        };

        newValidationErrors[fieldName] = undefined; // Clear previous error for this specific file field

        if (!file) { // If no file is selected (e.g., user cancels file dialog)
            resetFileState();
            setErrors(newValidationErrors);
            return;
        }

        // File validation (type and size)
        const fileNameStr = file.name.toLowerCase();
        const fileExtension = fileNameStr.split(".").pop();
        const allowedTypes = ["jpeg", "jpg", "png"]; // Allowed image types
        const maxSizeInBytes = 5 * 1024 * 1024; // 5MB limit

        let fileIsValid = true;
        if (!allowedTypes.includes(fileExtension)) {
            newValidationErrors[fieldName] = "Invalid file type! Only JPEG, JPG, or PNG allowed.";
            fileIsValid = false;
        } else if (file.size > maxSizeInBytes) {
            newValidationErrors[fieldName] = `File too large! Max size is 5MB.`;
            fileIsValid = false;
        }

        if (!fileIsValid) {
            resetFileState(); // Reset if file is invalid
        } else {
            // Revoke old blob URL if one exists for this field before creating a new one
            if (imagePreviews[fieldName] && typeof imagePreviews[fieldName] === 'string' && imagePreviews[fieldName].startsWith('blob:')) {
                URL.revokeObjectURL(imagePreviews[fieldName]);
            }
            const fileUrl = URL.createObjectURL(file); // Create a local URL for preview
            setFormData((prevData) => ({ ...prevData, [fieldName]: file })); // Store the File object
            setImagePreviews((prevPreviews) => ({ ...prevPreviews, [fieldName]: fileUrl })); // Set the blob URL for preview
        }
        setErrors(newValidationErrors); // Update errors state
    };

    // Handles reCAPTCHA verification
    const handleCaptchaVerify = (token) => {
        setCaptchaToken(token);
        if (errors.captcha) setErrors(prev => ({ ...prev, captcha: undefined })); // Clear captcha error
        setStatusMessage({ type: '', text: '' }); // Clear any previous status message
    };

    // Searches for location using Nominatim API based on text input
    const searchMapLocation = useCallback(async () => {
        const query = formData.lastSeenPlace?.trim();
        if (!query) {
            setStatusMessage({ type: 'error', text: 'Please enter a location to search.' });
            return;
        }
        if (errors.location) { // Clear previous location error
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
                    lastSeen: coordinates, // Store coordinates
                    lastSeenPlace: display_name // Update text field with formatted address
                }));
                setStatusMessage({ type: 'success', text: `Location found: ${display_name}` });
                setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000); // Clear message after 3s
            } else {
                setStatusMessage({ type: 'error', text: `Location "${query}" not found. Please try again or use the map.` });
                setFormData(prev => ({ ...prev, lastSeen: null })); // Clear coordinates if not found
            }
        } catch (error) {
            console.error("Error fetching location data from Nominatim:", error);
            setStatusMessage({ type: 'error', text: "Failed to search for location. Check connection or try again." });
            setFormData(prev => ({ ...prev, lastSeen: null }));
        } finally {
            setIsSearchingLocation(false);
        }
    }, [formData.lastSeenPlace, errors.location]); // Dependencies for useCallback

    // Handles form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default browser submission
        setStatusMessage({ type: '', text: '' }); // Clear previous status messages
        let validationErrors = { ...errors }; // Preserve existing file validation errors

        // --- Validation Checks ---
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
        
        // Photo validation: required if no new file is selected AND no existing Cloudinary preview is present
        if (!formData.photo) { // formData.photo is the File object, null if no new file selected
             if (!imagePreviews.photo || !imagePreviews.photo.startsWith(CLOUDINARY_BASE_URL)) { 
                validationErrors.photo = "Person's photo (JPEG/PNG) is required.";
            }
        }
        // Keep existing file validation errors if they were set during file change and not overridden
        if (errors.photo && !validationErrors.photo) validationErrors.photo = errors.photo;
        if (errors.idCard && !validationErrors.idCard) validationErrors.idCard = errors.idCard; // For ID card, it's optional, so only show existing validation error

        if (!captchaToken) validationErrors.captcha = "Please complete the reCAPTCHA verification.";

        // --- Get Reporter ID from localStorage ---
        let reporterId = null;
        try {
            const userDataString = localStorage.getItem('user');
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                reporterId = userData?.user_id; // Safely access user_id
            }
            if (!reporterId) {
                validationErrors.reporter = "User ID not found. Please log in again.";
                setStatusMessage({ type: 'error', text: 'User information missing. Please log in again.' });
            } else {
                // Clear reporter error if ID is found
                if (validationErrors.reporter) validationErrors.reporter = undefined;
            }
        } catch (parseError) {
            console.error("Error parsing user data from localStorage:", parseError);
            validationErrors.reporter = "Failed to read user data. Please log in again.";
            setStatusMessage({ type: 'error', text: 'Failed to read user information. Please log in again.' });
            reporterId = null;
        }

        setErrors(validationErrors); // Update errors state
        const hasErrors = Object.values(validationErrors).some(error => !!error);

        if (hasErrors || !reporterId) {
            // Set a general error message if no specific status message is already set by reporterId check
            if (!statusMessage.text && !validationErrors.reporter) { 
                setStatusMessage({ type: 'error', text: 'Please fix the errors highlighted in the form.' });
            }
            return; // Stop submission if there are errors
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
        if (formData.disasterType) apiFormData.append('disasterType', formData.disasterType);
        apiFormData.append('contactInfo', formData.contactInfo); 
        if (formData.additional_info) apiFormData.append('additional_info', formData.additional_info);
        
        // Only append files if they are actual File objects (i.e., new uploads)
        if (formData.idCard instanceof File) {
            apiFormData.append('idCard', formData.idCard, formData.idCard.name);
        }
        if (formData.photo instanceof File) {
            apiFormData.append('photo', formData.photo, formData.photo.name);
        }

        // Log FormData entries for debugging
        console.log("Submitting the following FormData to backend:");
        for (let [key, value] of apiFormData.entries()) {
            if (value instanceof File) {
                console.log(`${key}: File - Name: ${value.name}, Size: ${value.size}, Type: ${value.type}`);
            } else {
                console.log(`${key}: ${value}`);
            }
        }

        // --- API Call ---
        try {
            const response = await fetch(`${API_BASE_URL}/api/missing-persons/`, {
                method: 'POST',
                body: apiFormData,
                // Note: Do not set 'Content-Type': 'multipart/form-data' header manually.
                // The browser will set it correctly with the boundary when using FormData.
            });

            const responseData = await response.json(); // Attempt to parse JSON response

            if (!response.ok) { // Check if response status is not 2xx
                let errorString = `HTTP error ${response.status}`;
                // Try to get more detailed error from backend response
                if (typeof responseData === 'object' && responseData !== null) {
                    errorString = Object.entries(responseData)
                        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                        .join('; ');
                } else if (responseData.detail) { // Django REST framework often uses 'detail' for errors
                    errorString = responseData.detail;
                }
                throw new Error(errorString);
            }

            // --- Handle Successful Submission ---
            setStatusMessage({ type: 'success', text: 'Report submitted successfully!' });
            setErrors({}); // Clear all validation errors
            
            setFormData(initialFormData); // Reset form fields to initial state
            setSelectedState(null);       // Reset selected state
            setSelectedDistrict(null);    // Reset selected district
            setCaptchaToken(null);        // Reset reCAPTCHA token

            // Update imagePreviews with Cloudinary URLs from the backend response
            // Adjust field names (e.g., reportData.person_photo) based on your actual backend response structure
            const reportData = responseData.report || responseData; // Backend might return data directly or nested
            
            const newPhotoPreview = reportData.person_photo 
                ? `${CLOUDINARY_BASE_URL}${reportData.person_photo}` 
                : null;
            const newIdCardPreview = reportData.id_card_photo // Assuming backend provides this field for ID card
                ? `${CLOUDINARY_BASE_URL}${reportData.id_card_photo}`
                : null;

            setImagePreviews({
                photo: newPhotoPreview,
                idCard: newIdCardPreview
            });
            
            // Hide success message after a delay
            setTimeout(() => setStatusMessage({ type: '', text: '' }), 7000);

        } catch (error) {
            console.error("Form Submission API Error:", error);
            setStatusMessage({ type: 'error', text: `Submission failed: ${error.message}` });
        } finally {
            setIsSubmitting(false); // Ensure loading state is turned off
        }
    };

    // --- JSX for Rendering ---
    return (
        <Box
            sx={{
                position: "absolute", top: 0, left: 0, right: 0,
                minHeight: "100vh", 
                background: `linear-gradient(rgba(255, 255, 255, 0.90), rgba(255, 255, 255, 0.90)), url(${worldMapBackground})`,
                backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed",
                backgroundRepeat: "repeat-y", margin: 0, padding: 0, zIndex: 0,
            }}
        >
            <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 8 }, pb: 4, position: "relative" }}>
                <Typography align="center" sx={{ mt: 1, mb: 3, fontSize: { xs: "1.1rem", sm: "1.3rem", md: "1.5rem" }, fontWeight: "500" }}>
                    Report a Missing Person
                </Typography>

                {/* Status Message Alert */}
                {statusMessage.text && (
                    <Alert 
                        severity={statusMessage.type || 'info'} 
                        onClose={() => setStatusMessage({ type: '', text: '' })} // Allow closing the alert
                        sx={{ mb: 2, width: '100%', maxWidth: '800px', mx: 'auto' }}
                    >
                        {statusMessage.text}
                    </Alert>
                )}

                {/* Main Grid Layout: Form on Left, Map/Previews on Right */}
                <Grid container spacing={4} sx={{ display: "flex", justifyContent: "center" }}>
                    {/* Form Grid Item */}
                    <Grid item xs={12} md={6}>
                        <MissingPersonForm
                            formData={formData}
                            setFormData={setFormData} // Pass setFormData for child components like StateDistrictDropdown
                            handleInputChange={handleInputChange}
                            handleFileChange={handleFileChange}
                            handleSubmit={handleSubmit} // Passed to the form component
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

                    {/* Map and Image Previews Grid Item */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ p: 3, borderRadius: 3, boxShadow: 0, display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
                            <Typography align="center" sx={{ fontSize: { xs: "1rem", sm: "1.2rem" }, fontWeight: "500", mb: 0 }}>
                                Last Seen Location Map
                            </Typography>
                            <InteractiveMap
                                formData={formData} // Pass current form data for map display
                                setFormData={setFormData} // Allow map to update location in form data
                                setError={(mapError) => setStatusMessage({ type: 'error', text: mapError })}
                            />

                            {/* Image Previews Section */}
                            {(imagePreviews.photo || imagePreviews.idCard) && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography align="center" sx={{ fontSize: { xs: "1rem", sm: "1.2rem" }, fontWeight: "500", mb: 1 }}>
                                        Uploaded Images Preview
                                    </Typography>
                                    <Grid container spacing={2} justifyContent="center">
                                        {imagePreviews.photo && (
                                            <Grid item xs={12} sm={imagePreviews.idCard ? 6 : 12}>
                                                <img 
                                                    src={imagePreviews.photo} 
                                                    alt="Uploaded Photo Preview" 
                                                    style={{ width: "100%", borderRadius: 8, border: '1px solid #eee', maxHeight: '200px', objectFit: 'contain' }} 
                                                />
                                                <Typography align="center" variant="caption" display="block" sx={{ mt: 0.5 }}>Photo Preview</Typography>
                                            </Grid>
                                        )}
                                        {imagePreviews.idCard && (
                                            <Grid item xs={12} sm={imagePreviews.photo ? 6 : 12}>
                                                <img 
                                                    src={imagePreviews.idCard} 
                                                    alt="Uploaded ID Card Preview" 
                                                    style={{ width: "100%", borderRadius: 8, border: '1px solid #eee', maxHeight: '200px', objectFit: 'contain' }} 
                                                />
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

            {/* Submission Loading Overlay */}
            {isSubmitting && (
                <Box sx={{ 
                    position: 'fixed', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%', 
                    backgroundColor: 'rgba(0,0,0,0.5)', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    zIndex: 2000 
                }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2, color: 'white' }}>Submitting report...</Typography>
                </Box>
            )}
        </Box>
    );
};

export default MissingPersonPortal;
