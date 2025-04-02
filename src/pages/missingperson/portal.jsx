// import React, { useState, useEffect } from "react";
// import {
//   Container,
//   Grid,
//   TextField,
//   Button,
//   Card,
//   CardContent,
//   Typography,
//   Input,
//   MenuItem,
//   Select,
//   FormControl,
//   InputLabel,
//   Snackbar,
//   Alert,
// } from "@mui/material";
// import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";

// const customIcon = new L.Icon({
//   iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
// });

// const LocationSelector = ({ setFormData }) => {
//   useMapEvents({
//     click(e) {
//       setFormData((prev) => ({ ...prev, lastSeen: `${e.latlng.lat}, ${e.latlng.lng}` }));
//     },
//   });
//   return null;
// };

// const MissingPersonPortal = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     identificationMarks: "",
//     lastSeen: "",
//     contactInfo: "",
//     additionalInfo: "",
//     disasterType: "",
//     idCard: null,
//     photo: null,
//   });

//   const [reportedPersons, setReportedPersons] = useState([]);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState(false);
//   const [fileError, setFileError] = useState("");

//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];

//     if (e.target.name === "photo" && (!file || file.type !== "image/jpeg")) {
//       setFileError("Only JPEG files are allowed, and a photo is required.");
//       setFormData({ ...formData, photo: null });
//     } else {
//       setFileError("");
//       setFormData({ ...formData, [e.target.name]: file });
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!formData.lastSeen) {
//       setError("Please select a last seen location on the map.");
//       return;
//     }
//     if (!formData.photo) {
//       setFileError("Uploading a photo (JPEG) is required.");
//       return;
//     }

//     setReportedPersons([...reportedPersons, { ...formData, id: Date.now() }]);
//     setFormData({
//       name: "",
//       description: "",
//       identificationMarks: "",
//       lastSeen: "",
//       contactInfo: "",
//       additionalInfo: "",
//       disasterType: "",
//       idCard: null,
//       photo: null,
//     });
//     setSuccess(true);
//   };

//   return (
//     <>
//       <Container maxWidth="lg" sx={{ mt: 10, pb: 4 }}>
//         <Grid container spacing={4}>
//           <Grid item xs={12} md={6}>
//             <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
//               <Typography variant="h5" gutterBottom>
//                 Report a Missing Person
//               </Typography>
//               <form onSubmit={handleSubmit}>
//                 <TextField fullWidth margin="normal" label="Name" name="name" value={formData.name} onChange={handleInputChange} required />
//                 <TextField fullWidth margin="normal" label="Description" name="description" value={formData.description} onChange={handleInputChange} required />
//                 <TextField fullWidth margin="normal" label="Identification Marks" name="identificationMarks" value={formData.identificationMarks} onChange={handleInputChange} />
//                 <TextField fullWidth margin="normal" label="Last Seen Location (Click on map)" name="lastSeen" value={formData.lastSeen} disabled />
//                 <FormControl fullWidth margin="normal">
//                   <InputLabel>Disaster Type</InputLabel>
//                   <Select name="disasterType" value={formData.disasterType} onChange={handleInputChange}>
//                     <MenuItem value="Cyclones">Cyclones</MenuItem>
//                     <MenuItem value="Earthquakes">Earthquakes</MenuItem>
//                     <MenuItem value="Tsunamis">Tsunamis</MenuItem>
//                     <MenuItem value="Floods">Floods</MenuItem>
//                     <MenuItem value="Landslides">Landslides</MenuItem>
//                     <MenuItem value="Fire">Fire</MenuItem>
//                     <MenuItem value="Heatwave">Heatwave</MenuItem>
//                   </Select>
//                 </FormControl>
//                 <TextField fullWidth margin="normal" label="Contact Information" name="contactInfo" value={formData.contactInfo} onChange={handleInputChange} required />
//                 <TextField fullWidth margin="normal" label="Additional Information" name="additionalInfo" value={formData.additionalInfo} onChange={handleInputChange} />
//                 <Typography variant="subtitle1" sx={{ mt: 2 }}>Upload Identity Card:</Typography>
//                 <Input type="file" name="idCard" onChange={handleFileChange} fullWidth />
//                 <Typography variant="subtitle1" sx={{ mt: 2 }}>
//                   Upload Photo (JPEG Required):
//                 </Typography>
//                 <Input type="file" name="photo" onChange={handleFileChange} fullWidth required />
//                 {fileError && (
//                   <Typography color="error" variant="body2">
//                     {fileError}
//                   </Typography>
//                 )}
//                 <Button type="submit" variant="contained" color="primary" sx={{ mt: 2, width: "100%" }}>Submit</Button>
//               </form>
//             </Card>
//           </Grid>

//           {/* Map Section */}
//           <Grid item xs={12} md={6}>
//             <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
//               <CardContent>
//                 <Typography variant="h6">Last Seen Location</Typography>
//                 <div style={{ height: "400px", width: "100%", borderRadius: "12px", overflow: "hidden" }}>
//                   <MapContainer center={[15.2993, 74.124]} zoom={6} style={{ height: "100%", width: "100%" }}>
//                     <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//                     {reportedPersons.map((person) => (
//                       <Marker key={person.id} position={person.lastSeen.split(",").map(Number)} icon={customIcon}>
//                         <Popup>
//                           <Typography variant="body1">{person.name}</Typography>
//                         </Popup>
//                       </Marker>
//                     ))}
//                     <LocationSelector setFormData={setFormData} />
//                   </MapContainer>
//                 </div>
//               </CardContent>
//             </Card>
//           </Grid>
//         </Grid>
//       </Container>

//       {/* Success Message */}
//       <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
//         <Alert severity="success">Report submitted successfully!</Alert>
//       </Snackbar>
//     </>
//   );
// };

// export default MissingPersonPortal;


//correct without correct captcha
// import React, { useState } from "react";
// import {
//   Container,
//   Grid,
//   TextField,
//   Button,
//   Card,
//   Typography,
//   Input,
//   MenuItem,
//   Select,
//   FormControl,
//   InputLabel,
//   Snackbar,
//   Alert,
// } from "@mui/material";
// import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import { loadReCaptcha, ReCaptcha } from "react-google-recaptcha-v3";

// const customIcon = new L.Icon({
//   iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
// });

// const LocationSelector = ({ setFormData }) => {
//   useMapEvents({
//     click(e) {
//       setFormData((prev) => ({ ...prev, lastSeen: `${e.latlng.lat}, ${e.latlng.lng}` }));
//     },
//   });
//   return null;
// };

// const MissingPersonPortal = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     identificationMarks: "",
//     lastSeen: "",
//     contactInfo: "",
//     additionalInfo: "",
//     disasterType: "",
//     idCard: null,
//     photo: null,
//   });

//   const [reportedPersons, setReportedPersons] = useState([]);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState(false);
//   const [fileError, setFileError] = useState("");
//   const [captchaVerified, setCaptchaVerified] = useState(false);

//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];

//     if (e.target.name === "photo" && (!file || file.type !== "image/jpeg")) {
//       setFileError("Only JPEG files are allowed, and a photo is required.");
//       setFormData({ ...formData, photo: null });
//     } else {
//       setFileError("");
//       setFormData({ ...formData, [e.target.name]: file });
//     }
//   };

//   const handleCaptchaChange = (value) => {
//     setCaptchaVerified(!!value);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!formData.lastSeen) {
//       setError("Please select a last seen location on the map.");
//       return;
//     }
//     if (!formData.photo) {
//       setFileError("Uploading a photo (JPEG) is required.");
//       return;
//     }
//     if (!captchaVerified) {
//       setError("Please complete the CAPTCHA verification.");
//       return;
//     }

//     setReportedPersons([...reportedPersons, { ...formData, id: Date.now() }]);
//     setFormData({
//       name: "",
//       description: "",
//       identificationMarks: "",
//       lastSeen: "",
//       contactInfo: "",
//       additionalInfo: "",
//       disasterType: "",
//       idCard: null,
//       photo: null,
//     });
//     setSuccess(true);
//   };

//   return (
//     <>
//       <Container maxWidth="lg" sx={{ mt: 10, pb: 4 }}>
//         <Grid container spacing={4}>
//           <Grid item xs={12} md={6}>
//             <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
//               <Typography variant="h5" gutterBottom>
//                 Report a Missing Person
//               </Typography>
//               <form onSubmit={handleSubmit}>
//                 <TextField fullWidth margin="normal" label="Name" name="name" value={formData.name} onChange={handleInputChange} required />
//                 <TextField fullWidth margin="normal" label="Description" name="description" value={formData.description} onChange={handleInputChange} required />
//                 <TextField fullWidth margin="normal" label="Identification Marks" name="identificationMarks" value={formData.identificationMarks} onChange={handleInputChange} />
//                 <TextField fullWidth margin="normal" label="Last Seen Location (Click on map)" name="lastSeen" value={formData.lastSeen} disabled />
//                 <FormControl fullWidth margin="normal">
//                   <InputLabel>Disaster Type</InputLabel>
//                   <Select name="disasterType" value={formData.disasterType} onChange={handleInputChange}>
//                     <MenuItem value="Cyclones">Cyclones</MenuItem>
//                     <MenuItem value="Earthquakes">Earthquakes</MenuItem>
//                     <MenuItem value="Tsunamis">Tsunamis</MenuItem>
//                     <MenuItem value="Floods">Floods</MenuItem>
//                     <MenuItem value="Landslides">Landslides</MenuItem>
//                     <MenuItem value="Fire">Fire</MenuItem>
//                     <MenuItem value="Heatwave">Heatwave</MenuItem>
//                   </Select>
//                 </FormControl>
//                 <TextField fullWidth margin="normal" label="Contact Information" name="contactInfo" value={formData.contactInfo} onChange={handleInputChange} required />
//                 <TextField fullWidth margin="normal" label="Additional Information" name="additionalInfo" value={formData.additionalInfo} onChange={handleInputChange} />
//                 <Typography variant="subtitle1" sx={{ mt: 2 }}>Upload Identity Card:</Typography>
//                 <Input type="file" name="idCard" onChange={handleFileChange} fullWidth />
//                 <Typography variant="subtitle1" sx={{ mt: 2 }}>Upload Photo (JPEG Required):</Typography>
//                 <Input type="file" name="photo" onChange={handleFileChange} fullWidth required />
//                 {fileError && <Typography color="error" variant="body2">{fileError}</Typography>}
//                 <ReCAPTCHA sitekey="6LfyGwcrAAAAAIljljWmE0jVM33GJ41IL04cOhiH" onChange={handleCaptchaChange} sx={{ mt: 2 }} />
//                 <Button type="submit" variant="contained" color="primary" sx={{ mt: 2, width: "100%" }} disabled={!captchaVerified}>Submit</Button>
//               </form>
//             </Card>
//           </Grid>
//           {/* Map Section */}
//           <Grid item xs={12} md={6}>
//             <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
//               <Typography variant="h5" gutterBottom>
//                 Last Seen Location
//               </Typography>
//               <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "400px", width: "100%" }}>
//                 <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//                 <LocationSelector setFormData={setFormData} />
//                 {formData.lastSeen && (
//                   <Marker position={formData.lastSeen.split(",").map(Number)} icon={customIcon}>
//                     <Popup>Last seen location</Popup>
//                   </Marker>
//                 )}
//               </MapContainer>
//             </Card>
//           </Grid>
//         </Grid>
//       </Container>
//       <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
//         <Alert severity="success">Report submitted successfully!</Alert>
//       </Snackbar>
//     </>
//   );
// };

// export default MissingPersonPortal;
import React, { useState } from "react";
import {
  Container, Grid, TextField, Button, Card, Typography,
  Input, MenuItem, Select, FormControl, InputLabel, Snackbar, Alert
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
      setFormData((prev) => ({ ...prev, lastSeen: [e.latlng.lat, e.latlng.lng] }));
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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
  
    if (!file) return;
  
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split('.').pop();
  
    if (e.target.name === "photo") {
      if (file.type !== "image/jpeg" || fileExtension !== "jpeg") {
        setFileError("Only JPEG (.jpeg) files are allowed.");
        setFormData({ ...formData, photo: null });
        return;
      }
    }
  
    setFileError("");
    setFormData({ ...formData, [e.target.name]: file });
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
      setFileError("Uploading a photo (JPEG) is required.");
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
    setCaptchaToken(null);
    setSuccess(true);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 10, pb: 4 }}>
      <Grid container spacing={4}>
        {/* Left Side - Form */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h5" gutterBottom>
              Report a Missing Person
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField fullWidth margin="normal" label="Name" name="name" value={formData.name} onChange={handleInputChange} required />
              <TextField fullWidth margin="normal" label="Description" name="description" value={formData.description} onChange={handleInputChange} required />
              <TextField fullWidth margin="normal" label="Identification Marks" name="identificationMarks" value={formData.identificationMarks} onChange={handleInputChange} />
              <TextField fullWidth margin="normal" label="Last Seen Location (Click on map)" name="lastSeen" value={formData.lastSeen ? formData.lastSeen.join(", ") : ""} disabled />
              <FormControl fullWidth margin="normal">
                <InputLabel>Disaster Type</InputLabel>
                <Select name="disasterType" value={formData.disasterType} onChange={handleInputChange}>
                  <MenuItem value="Cyclones">Cyclones</MenuItem>
                  <MenuItem value="Earthquakes">Earthquakes</MenuItem>
                  <MenuItem value="Tsunamis">Tsunamis</MenuItem>
                  <MenuItem value="Floods">Floods</MenuItem>
                  <MenuItem value="Landslides">Landslides</MenuItem>
                  <MenuItem value="Fire">Fire</MenuItem>
                  <MenuItem value="Heatwave">Heatwave</MenuItem>
                </Select>
              </FormControl>
              <TextField fullWidth margin="normal" label="Contact Information" name="contactInfo" value={formData.contactInfo} onChange={handleInputChange} required />
              <TextField fullWidth margin="normal" label="Additional Information" name="additionalInfo" value={formData.additionalInfo} onChange={handleInputChange} />
              <Typography variant="subtitle1" sx={{ mt: 2 }}>Upload Identity Card:</Typography>
              <Input type="file" name="idCard" onChange={handleFileChange} fullWidth />
              <Typography variant="subtitle1" sx={{ mt: 2 }}>Upload Photo (JPEG Required):</Typography>
              <Input type="file" name="photo" onChange={handleFileChange} fullWidth required />
              {fileError && <Typography color="error" variant="body2">{fileError}</Typography>}

              {/* reCAPTCHA v2 */}
              <ReCAPTCHA 
                sitekey="6LcfLAcrAAAAACJZCZHt9WRxK_4CxM9gv6pwP-94"
                onChange={handleCaptchaVerify}
              />

              <Button type="submit" variant="contained" color="primary" sx={{ mt: 2, width: "100%" }}>
                Submit
              </Button>
            </form>
          </Card>
        </Grid>

        {/* Right Side - Map */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h5" gutterBottom>
              Last Seen Location
            </Typography>
            <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "400px", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationSelector setFormData={setFormData} />
              {formData.lastSeen && (
                <Marker position={formData.lastSeen} icon={customIcon}>
                  <Popup>Last seen location</Popup>
                </Marker>
              )}
            </MapContainer>
          </Card>
        </Grid>
      </Grid>

      {/* Success Snackbar */}
      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
        <Alert severity="success">Report submitted successfully!</Alert>
      </Snackbar>
    </Container>
  );
};

export default MissingPersonPortal;









