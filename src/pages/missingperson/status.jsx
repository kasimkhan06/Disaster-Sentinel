import React, { useState } from "react";
import { Container, Card, Typography, TextField, Button, MenuItem, Select, FormControl, InputLabel, Box, Avatar } from "@mui/material";

const mockData = [
  { 
    id: "12345", 
    name: "John Doe", 
    status: "Under Investigation", 
    disasterType: "Floods", 
    contactInfo: "9876543210", 
    additionalInfo: "Wearing a blue shirt",
    lastSeen: "Mumbai, India",
    photo: "https://randomuser.me/api/portraits/men/1.jpg"
  },
  { 
    id: "67890", 
    name: "Jane Smith", 
    status: "Found", 
    disasterType: "Earthquake", 
    contactInfo: "8765432109", 
    additionalInfo: "Has a birthmark on hand",
    lastSeen: "Delhi, India",
    photo: "https://randomuser.me/api/portraits/women/1.jpg"
  },
];

const StatusTracking = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [editedInfo, setEditedInfo] = useState({});
  const [data, setData] = useState(mockData); // Local state to simulate data update

  const handleSearch = () => {
    const foundPerson = data.find(
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

  const handleSaveChanges = () => {
    const updatedData = data.map((person) =>
      person.id === selectedPerson.id
        ? { ...person, additionalInfo: editedInfo.additionalInfo }
        : person
    );
    setData(updatedData);
    setSelectedPerson({ ...selectedPerson, additionalInfo: editedInfo.additionalInfo });
  };

  const handleMarkFound = () => {
    const updatedData = data.map((person) =>
      person.id === selectedPerson.id ? { ...person, status: "Found" } : person
    );
    setData(updatedData);
    setSelectedPerson({ ...selectedPerson, status: "Found" });
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
          
          <Box sx={{ display: "flex", alignItems: "center", mt: 2, gap: 2 }}>
            <Avatar src={selectedPerson.photo} sx={{ width: 80, height: 80 }} />
            <Box>
              <Typography variant="body1"><strong>Name:</strong> {selectedPerson.name}</Typography>
              <Typography variant="body1"><strong>Disaster Type:</strong> {selectedPerson.disasterType}</Typography>
              <Typography variant="body1"><strong>Last Seen:</strong> {selectedPerson.lastSeen}</Typography>
              <Typography variant="body1"><strong>Contact Info:</strong> {selectedPerson.contactInfo}</Typography>
            </Box>
          </Box>

          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select value={selectedPerson.status} disabled>
              <MenuItem value="Under Investigation">Under Investigation</MenuItem>
              <MenuItem value="Found">Found</MenuItem>
              <MenuItem value="No Updates">No Updates</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="body2" sx={{ mt: 2 }}><strong>Additional Info:</strong> {selectedPerson.additionalInfo}</Typography>

          <TextField 
            fullWidth 
            margin="normal" 
            label="Update Additional Information" 
            name="additionalInfo" 
            value={editedInfo.additionalInfo} 
            onChange={handleEditChange} 
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            <Button variant="contained" color="primary" onClick={handleSaveChanges}>
              Save Changes
            </Button>
            {selectedPerson.status !== "Found" && (
              <Button variant="outlined" color="success" onClick={handleMarkFound}>
                Mark as Found
              </Button>
            )}
          </Box>
        </Card>
      )}
    </Container>
  );
};

export default StatusTracking;
