import React, { useState } from "react";
import { Container, Card, Typography, TextField, Button, MenuItem, Select, FormControl, InputLabel } from "@mui/material";

const mockData = [
  { 
    id: "12345", 
    name: "John Doe", 
    status: "Under Investigation", 
    disasterType: "Floods", 
    contactInfo: "9876543210", 
    additionalInfo: "Wearing a blue shirt",
    lastSeen: "Mumbai, India",
  },
  { 
    id: "67890", 
    name: "Jane Smith", 
    status: "Found", 
    disasterType: "Earthquake", 
    contactInfo: "8765432109", 
    additionalInfo: "Has a birthmark on hand",
    lastSeen: "Delhi, India",
  },
];

const StatusTracking = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [editedInfo, setEditedInfo] = useState({});

  const handleSearch = () => {
    const foundPerson = mockData.find(
      (person) => person.id === searchTerm || person.name.toLowerCase() === searchTerm.toLowerCase()
    );
    if (foundPerson) {
      setSelectedPerson(foundPerson);
      setEditedInfo({ additionalInfo: foundPerson.additionalInfo });
    } else {
      setSelectedPerson(null);
    }
  };

  const handleEditChange = (e) => {
    setEditedInfo({ ...editedInfo, [e.target.name]: e.target.value });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8, pb: 4 }}>
      <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h5" gutterBottom>
          Track Missing Person Status
        </Typography>
        <TextField 
          fullWidth 
          label="Enter Name or ID" 
          variant="outlined" 
          margin="normal" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
        <Button variant="contained" color="primary" onClick={handleSearch} sx={{ mt: 2, width: "100%" }}>
          Search
        </Button>
      </Card>

      {selectedPerson && (
        <Card sx={{ p: 3, mt: 4, borderRadius: 3, boxShadow: 3 }}>
          <Typography variant="h6">Missing Person Details</Typography>
          <Typography variant="body1"><strong>Name:</strong> {selectedPerson.name}</Typography>
          <Typography variant="body1"><strong>Disaster Type:</strong> {selectedPerson.disasterType}</Typography>
          <Typography variant="body1"><strong>Last Seen:</strong> {selectedPerson.lastSeen}</Typography>
          <Typography variant="body1"><strong>Contact Info:</strong> {selectedPerson.contactInfo}</Typography>
          
          {/* Status Dropdown (Editable by Agencies) */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select value={selectedPerson.status} disabled>
              <MenuItem value="Under Investigation">Under Investigation</MenuItem>
              <MenuItem value="Found">Found</MenuItem>
              <MenuItem value="No Updates">No Updates</MenuItem>
            </Select>
          </FormControl>

          {/* Editable Fields */}
          <TextField 
            fullWidth 
            margin="normal" 
            label="Additional Information (Editable)" 
            name="additionalInfo" 
            value={editedInfo.additionalInfo} 
            onChange={handleEditChange} 
          />

          <Button variant="contained" color="primary" sx={{ mt: 2, width: "50%" , margin: "auto"}}>
            Save Changes
          </Button>
        </Card>
      )}
    </Container>
  );
};

export default StatusTracking;
