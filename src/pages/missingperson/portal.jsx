import React, { useState } from "react"; 
import Grid from "@mui/material/Grid2";
import {
  Container, 
  TextField, 
  Button, 
  Card, 
  Typography, 
  Input, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel, 
  Box,
  Autocomplete
} from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ReCAPTCHA from "react-google-recaptcha";

// Custom map marker icon
const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Component to handle map click event
const LocationSelector = ({ setFormData }) => {
  useMapEvents({
    click(e) {
      setFormData(prev => ({
        ...prev,
        lastSeen: [e.latlng.lat, e.latlng.lng],
        // Clear any place name when clicking directly on map
        lastSeenPlace: prev.lastSeenPlace || "Selected Location" 
      }));
    },
  });
  return null;
};

const MissingPersonPortal = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    identificationMarks: "",
    lastSeen: null,
    contactInfo: "",
    additionalInfo: "",
    disasterType: "",
    idCard: null,
    photo: null,
  });

  const [reportedPersons, setReportedPersons] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [fileError, setFileError] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);
  const [imagePreviews, setImagePreviews] = useState({ photo: null, idCard: null });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split(".").pop();

    if (fileExtension !== "jpeg") {
      setFileError((prevErrors) => ({
        ...prevErrors,
        [e.target.name]: "Invalid file type! Only .jpeg files are allowed.",
      }));
      setFormData((prevData) => ({ ...prevData, [e.target.name]: null }));
      setImagePreviews((prevPreviews) => ({ ...prevPreviews, [e.target.name]: null }));
      return;
    }

    const fileUrl = URL.createObjectURL(file);

    setFileError((prevErrors) => ({
      ...prevErrors,
      [e.target.name]: "",
    }));
    setFormData((prevData) => ({ ...prevData, [e.target.name]: file }));
    setImagePreviews((prevPreviews) => ({ ...prevPreviews, [e.target.name]: fileUrl }));
  };

  const handleCaptchaVerify = (token) => {
    setCaptchaToken(token);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.disasterType) {
      setError("Please select a disaster type.");
      return;
    }
    if (!formData.lastSeen) {
      setError("Please select a last seen location on the map.");
      return;
    }
    if (!formData.photo) {
      setFileError((prevErrors) => ({
        ...prevErrors,
        photo: "Uploading a photo (JPEG) is required.",
      }));
      return;
    }
    if (!captchaToken) {
      setError("Please complete the reCAPTCHA verification.");
      return;
    }

    setReportedPersons([...reportedPersons, { ...formData, id: Date.now() }]);
    
    setFormData({
      name: "",
      description: "",
      identificationMarks: "",
      lastSeen: null,
      contactInfo: "",
      additionalInfo: "",
      disasterType: "",
      idCard: null,
      photo: null,
    });

    setImagePreviews({ photo: null, idCard: null });
    setFileError({});
    setCaptchaToken(null);
    setError("");
    setSuccess(true);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 10, pb: 4, minHeight: "100vh", overflow: "hidden" }}>
      {/* Title Centered */}
      <Typography
                    align="center"
                    sx={{
                      mt: 2,
                      mb: 4,
                      fontSize: {
                        xs: "1rem",
                        sm: "1.2rem",
                        md: "1.4rem",
                        lg:  "1.4rem",
                      },
                      fontWeight: "500",
                    }}
                  >
        Report a Missing Person
      </Typography>

      <Grid 
        container 
        spacing={4} 
        alignItems="stretch" 
        sx={{ display: "flex", justifyContent: "center" }}
      >
        {/* Left Side - Form */}
        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: 0, height: "100%" }}>
          <Typography
                    align="center"
                    sx={{
                      mt: 0,
                      mb: 1,
                      fontSize: {
                        xs: "1rem",
                        sm: "1.2rem",
                        md:  "1.2rem",
                        lg:  "1.2rem",
                      },
                      fontWeight: "500",
                    }}
                  >
              Report Details
            </Typography>
            <form onSubmit={handleSubmit}>
              {/* Name Field */}
              <Grid container spacing={0}>
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ display: "flex", justifyContent: "right" }}>
                  <Box
                    sx={{
                      width: "80%",
                      padding: 0,
                      mb: 2,
                      textAlign: "left",
                      boxShadow: "2px 2px 2px #E8F1F5",
                      position: "relative",
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      sx={{
                        "& .MuiInputBase-root": {
                          padding: "4px 8px",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: "0.9rem",
                        },
                        width: "100%",
                      }}
                    />
                  </Box>
                </Grid>

                {/* Description Field */}
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ display: "flex", justifyContent: "right" }}>
                  <Box
                    sx={{
                      width: "80%",
                      padding: 0,
                      mb: 2,
                      textAlign: "left",
                      boxShadow: "2px 2px 2px #E8F1F5",
                      position: "relative",
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      sx={{
                        "& .MuiInputBase-root": {
                          padding: "4px 8px",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: "0.9rem",
                        },
                        width: "100%",
                      }}
                    />
                  </Box>
                </Grid>

                {/* Identification Marks Field */}
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ display: "flex", justifyContent: "right" }}>
                  <Box
                    sx={{
                      width: "80%",
                      padding: 0,
                      mb: 2,
                      textAlign: "left",
                      boxShadow: "2px 2px 2px #E8F1F5",
                      position: "relative",
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Identification Marks"
                      name="identificationMarks"
                      value={formData.identificationMarks}
                      onChange={handleInputChange}
                      variant="outlined"
                      sx={{
                        "& .MuiInputBase-root": {
                          padding: "4px 8px",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: "0.9rem",
                        },
                        width: "100%",
                      }}
                    />
                  </Box>
                </Grid>

                {/* Last Seen Location Field */}
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ display: "flex", justifyContent: "right" }}>
                  <Box
                    sx={{
                      width: "80%",
                      padding: 0,
                      mb: 2,
                      textAlign: "left",
                      boxShadow: "2px 2px 2px #E8F1F5",
                      position: "relative",
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Last Seen Location (Enter Place Name)"
                      name="lastSeenPlace"
                      value={formData.lastSeenPlace || ""}
                      onChange={(e) => setFormData({ ...formData, lastSeenPlace: e.target.value })}
                      required
                      variant="outlined"
                      sx={{
                        "& .MuiInputBase-root": {
                          padding: "4px 8px",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: "0.9rem",
                        },
                        width: "100%",
                      }}
                    />
                  </Box>
                </Grid>

                {/* Disaster Type Field */}
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ display: "flex", justifyContent: "right" }}>
                  <Box
                    sx={{
                      width: "80%",
                      padding: 0,
                      mb: 2,
                      textAlign: "left",
                      boxShadow: "2px 2px 2px #E8F1F5",
                      position: "relative",
                    }}
                  >
                    <FormControl fullWidth>
                      <InputLabel sx={{ fontSize: "0.9rem" }}>Disaster Type</InputLabel>
                      <Select
                        name="disasterType"
                        value={formData.disasterType}
                        onChange={handleInputChange}
                        sx={{
                          "& .MuiInputBase-root": {
                            padding: "4px 8px",
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                        }}
                      >
                        <MenuItem value="Cyclones">Cyclones</MenuItem>
                        <MenuItem value="Earthquakes">Earthquakes</MenuItem>
                        <MenuItem value="Tsunamis">Tsunamis</MenuItem>
                        <MenuItem value="Floods">Floods</MenuItem>
                        <MenuItem value="Landslides">Landslides</MenuItem>
                        <MenuItem value="Fire">Fire</MenuItem>
                        <MenuItem value="Heatwave">Heatwave</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>

                {/* Contact Information Field */}
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ display: "flex", justifyContent: "right" }}>
                  <Box
                    sx={{
                      width: "80%",
                      padding: 0,
                      mb: 2,
                      textAlign: "left",
                      boxShadow: "2px 2px 2px #E8F1F5",
                      position: "relative",
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Contact Information"
                      name="contactInfo"
                      value={formData.contactInfo}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      sx={{
                        "& .MuiInputBase-root": {
                          padding: "4px 8px",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: "0.9rem",
                        },
                        width: "100%",
                      }}
                    />
                  </Box>
                </Grid>

                {/* Additional Information Field */}
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ display: "flex", justifyContent: "right" }}>
                  <Box
                    sx={{
                      width: "80%",
                      padding: 0,
                      mb: 0,
                      textAlign: "left",
                      boxShadow: "2px 2px 2px #E8F1F5",
                      position: "relative",
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Additional Information"
                      name="additionalInfo"
                      value={formData.additionalInfo}
                      onChange={handleInputChange}
                      variant="outlined"
                      sx={{
                        "& .MuiInputBase-root": {
                          padding: "4px 8px",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: "0.9rem",
                        },
                        width: "100%",
                      }}
                    />
                  </Box>
                </Grid>

                {/* File Uploads */}
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ display: "flex", justifyContent: "right" , width: "90%" }}>
                <Typography align="center" variant="subtitle1" sx={{ mt: 2, mr: 30 }}>Upload Identity Card:</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ display: "flex", justifyContent: "right" , width: "90%", mr:10 }}>
                    <Input type="file" name="idCard" onChange={handleFileChange}  />
                    {fileError.idCard && <Typography color="error" variant="body2">{fileError.idCard}</Typography>}
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ display: "flex", justifyContent: "right" , width: "90%" }}>
                <Typography align="center" variant="subtitle1" sx={{ mt: 2, mr: 21 }}>Upload Photo (JPEG Required):</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ display: "flex", justifyContent: "right" , width: "90%", mr:10 }}>
                  <Input type="file" name="photo" onChange={handleFileChange} required />
                  {fileError.photo && <Typography color="error" variant="body2">{fileError.photo}</Typography>}
                </Grid>

                {/* reCAPTCHA */}
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ml:11}}>
                  <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
                    <ReCAPTCHA sitekey="6LcfLAcrAAAAACJZCZHt9WRxK_4CxM9gv6pwP-94" onChange={handleCaptchaVerify} />
                  </div>
                </Grid>

                {/* Submit Button */}
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                  <Button disableRipple type="submit"
                    sx={{
                      height: { md: 62 }, // Match the height of the Autocomplete boxes
                      // padding: "8px 16px", // Adjust padding
                      paddingY: "9px",
                      // pr: { xs: 1, md: 0 },
                      // pl: 1,
                      // marginX: "auto",
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      ml:30,
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: "white", // Maintain the original background
                      "&:hover": {
                        backgroundColor: "white", // Prevent color change on hover
                      },
                    }}>
                    Submit
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Card>
        </Grid>

        {/* Vertical Line
        <Grid item xs={0.5} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ width: "2px", height: "100%", backgroundColor: "#ccc" }}></div>
        </Grid> */}

        {/* Right Side - Map */}
        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
          <Card
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: 0,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Typography
                    align="center"
                    sx={{
                      mt: 0,
                      mb: 1,
                      fontSize: {
                        xs: "1rem",
                        sm: "1.2rem",
                        md:  "1.2rem",
                        lg:  "1.2rem",
                      },
                      fontWeight: "500",
                    }}
                  >
              Last Seen Location
            </Typography>

            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: "400px",
                borderRadius: 2,
                overflow: "hidden",
                mt: 2,
              }}
            >
              {/* Map */}
              <MapContainer
  center={[20.5937, 78.9629]}
  zoom={5}
  style={{
    height: "100%",
    width: "100%",
    position: "absolute",
    zIndex: 1,
  }}
>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  {formData.lastSeen && (
    <Marker 
      position={formData.lastSeen} 
      icon={customIcon}
      eventHandlers={{
        click: () => {
          // Optional: handle marker click if needed
        },
      }}
    >
      <Popup>
        {formData.lastSeenPlace || "Selected Location"}
      </Popup>
    </Marker>
  )}
  <LocationSelector setFormData={setFormData} />
</MapContainer>

              {/* 4-side white blur overlay */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                  background: `
                    linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 3%),
                    linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 3%),
                    linear-gradient(to left, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 3%),
                    linear-gradient(to right, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 3%)
                  `,
                  zIndex: 2,
                }}
              />
            </Box>
          </Card>

          {/* Image Previews */}
          {imagePreviews.photo && (
            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ mt: 3 }}>
              <Card sx={{ p: 3, borderRadius: 3, boxShadow: 0 }}>
              <Typography
                    align="center"
                    sx={{
                      mt: 0,
                      mb: 1,
                      fontSize: {
                        xs: "1rem",
                        sm: "1.2rem",
                        md:  "1.2rem",
                        lg:  "1.2rem",
                      },
                      fontWeight: "500",
                    }}
                  >
                  Uploaded Images Preview
                </Typography>
                <Grid container spacing={2} justifyContent="center">
                  {imagePreviews.idCard ? (
                    <>
                      <Grid item size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                        <img src={imagePreviews.photo} alt="Uploaded Photo" style={{ width: "100%", borderRadius: 8 }} />
                        <Typography align="center">Uploaded Photo</Typography>
                      </Grid>
                      <Grid item size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                        <img src={imagePreviews.idCard} alt="Uploaded ID Card" style={{ width: "100%", borderRadius: 8 }} />
                        <Typography align="center">Uploaded ID Card</Typography>
                      </Grid>
                    </>
                  ) : (
                    <Grid item xs={12}>
                      <img src={imagePreviews.photo} alt="Uploaded Photo" style={{ width: "100%", borderRadius: 8 }} />
                      <Typography align="center">Uploaded Photo</Typography>
                    </Grid>
                  )}
                </Grid>
              </Card>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default MissingPersonPortal;