import React, { useState } from "react";
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
} from "@mui/material";
import worldMapBackground from "/assets/background_image/world-map-background.jpg";

const mockData = [
  {
    id: "12345",
    name: "John Doe",
    age: 30,
    gender: "Male",
    status: "Under Investigation",
    disasterType: "Floods",
    contactInfo: "9876543210",
    additionalInfo: "",
    lastSeen: "Mumbai, India",
    photo: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    id: "67890",
    name: "Jane Smith",
    age: 28,
    gender: "Female",
    status: "Found",
    disasterType: "Earthquake",
    contactInfo: "8765432109",
    additionalInfo: "",
    lastSeen: "Delhi, India",
    photo: "https://randomuser.me/api/portraits/men/1.jpg",
  },
];

const StatusTracking = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [editedInfo, setEditedInfo] = useState({});
  const [data, setData] = useState(mockData);

  const handleSearch = (newValue) => {
    if (!newValue) return;

    // Extract ID from the format "Name (ID)"
    const idMatch = newValue.match(/\(([^)]+)\)$/);
    const idFromText = idMatch ? idMatch[1] : newValue;

    const foundPerson = data.find(
      (person) =>
        person.id === idFromText ||
        person.name.toLowerCase() === newValue.toLowerCase()
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
    setSelectedPerson({
      ...selectedPerson,
      additionalInfo: editedInfo.additionalInfo,
    });
  };

  const handleMarkFound = () => {
    const updatedData = data.map((person) =>
      person.id === selectedPerson.id ? { ...person, status: "Found" } : person
    );
    setData(updatedData);
    setSelectedPerson({ ...selectedPerson, status: "Found" });
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        minHeight: "100vh",
        background: `
          linear-gradient(rgba(255, 255, 255, 0.90), rgba(255, 255, 255, 0.90)),
          url(${worldMapBackground})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "repeat-y",
        margin: 0,
        padding: 0,
        zIndex: 0, // Only needed if you have other elements with zIndex
      }}
    >
      <Container maxWidth="md" sx={{ mt: 8, pb: 4 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "100px",
          }}
        >
          <Autocomplete
            freeSolo
            id="person-search-input"
            disableClearable
            options={data.map((person) => `${person.name} (${person.id})`)}
            onChange={(event, newValue) => {
              setSearchTerm(newValue);
              handleSearch(newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search by Name or ID"
                slotProps={{
                  input: {
                    ...params.InputProps,
                    type: "search",
                  },
                }}
                sx={{
                  borderBottom: "2px solid #eee",
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                    "& fieldset": {
                      borderColor: "transparent",
                    },
                    "&:hover fieldset": {
                      borderColor: "transparent",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "transparent",
                    },
                    "&:focus": {
                      outline: "none",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "inherit",
                  },
                  "& .MuiInputBase-input": {
                    fontSize: {
                      xs: "0.7rem",
                      sm: "0.8rem",
                      // md: isBelow ? "0.9rem" : "1rem",
                      // lg: isBelow ? "0.9rem" : "1rem",
                    },
                  },
                  "&::placeholder": {
                    fontSize: "1rem",
                  },
                  width: { xs: "300px", md: "400px" },
                }}
              />
            )}
          />
        </div>

        {selectedPerson && (
          <Card
            sx={{
              width: 550,
              mx: "auto",
              p: 3,
              mt: 4,
              borderRadius: 2,
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography variant="h6" align="center">
              Missing Person Details
            </Typography>

            <Box
              sx={{ display: "flex", justifyContent: "center", mt: 2, gap: 2 }}
            >
              <Avatar
                src={selectedPerson.photo}
                sx={{ width: 100, height: 100 }}
              />
              <Box>
                <Typography variant="body1">
                  <strong>Name:</strong> {selectedPerson.name}
                </Typography>
                <Typography variant="body1">
                  <strong>Age:</strong> {selectedPerson.age}
                </Typography>
                <Typography variant="body1">
                  <strong>Gender:</strong> {selectedPerson.gender}
                </Typography>
                <Typography variant="body1">
                  <strong>Disaster Type:</strong> {selectedPerson.disasterType}
                </Typography>
                <Typography variant="body1">
                  <strong>Last Seen:</strong> {selectedPerson.lastSeen}
                </Typography>
                <Typography variant="body1">
                  <strong>Contact Info:</strong> {selectedPerson.contactInfo}
                </Typography>
                <Typography variant="body1">
                  <strong>Additional Info:</strong>{" "}
                  {selectedPerson.additionalInfo}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 2, gap: 2 }}>
              <TextField
                // fullWidth
                sx={{ width: { xs: "85%", sm: "80%" } }}
                variant="standard"
                margin="normal"
                label="Update Additional Information"
                name="additionalInfo"
                value={editedInfo.additionalInfo}
                onChange={handleEditChange}
              />

              <FormControl
                // fullWidth
                sx={{ width: { xs: "85%", sm: "70%" } }}
                margin="normal"
                variant="standard"
              >
                <InputLabel>Status</InputLabel>
                <Select value={selectedPerson.status} disabled>
                  <MenuItem value="Under Investigation">
                    Under Investigation
                  </MenuItem>
                  <MenuItem value="Found">Found</MenuItem>
                  <MenuItem value="No Updates">No Updates</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}
            >
              <Button color="primary" onClick={handleSaveChanges}>
                Save Changes
              </Button>
              {selectedPerson.status !== "Found" && (
                <Button color="success" onClick={handleMarkFound}>
                  Mark as Found
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
