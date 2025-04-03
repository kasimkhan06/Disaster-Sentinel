import React, { useState } from "react";
import {Box,Typography,TextField,Button,Container,Grid,Paper,Input,} from "@mui/material";

const MissingPersonForm = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [identificationMarks, setIdentificationMarks] = useState("");
  const [lastSeen, setLastSeen] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [identityCard, setIdentityCard] = useState(null);
  const [photos, setPhotos] = useState(null);

  const handleFileChange = (event, setter) => {
    setter(event.target.files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      name,
      description,
      identificationMarks,
      lastSeen,
      contactInfo,
      identityCard,
      photos,
    });
    alert("Missing person report submitted successfully!");
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: "bold" }}>
          Report a Missing Person
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField fullWidth label="Name" variant="standard" value={name} onChange={(e) => setName(e.target.value)} required />
            </Grid>
            
            <Grid item xs={12}>
              <TextField fullWidth label="Description" variant="standard"  value={description} onChange={(e) => setDescription(e.target.value)} multiline rows={2} required />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Identification Marks" variant="standard" value={identificationMarks} onChange={(e) => setIdentificationMarks(e.target.value)} required />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Last Seen" variant="standard" value={lastSeen} onChange={(e) => setLastSeen(e.target.value)} required />
            </Grid>
            
            <Grid item xs={12}>
              <TextField fullWidth label="Contact Information" variant="standard" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} required />
            </Grid>
            
            <Grid item xs={12}>
              <Typography>Upload Identity Card</Typography>
              <Input type="file" onChange={(e) => handleFileChange(e, setIdentityCard)} fullWidth />
            </Grid>
            
            <Grid item xs={12}>
              <Typography>Upload Photos</Typography>
              <Input type="file" multiple onChange={(e) => handleFileChange(e, setPhotos)} fullWidth />
            </Grid>
            
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" size="large">
                Submit Report
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default MissingPersonForm;
