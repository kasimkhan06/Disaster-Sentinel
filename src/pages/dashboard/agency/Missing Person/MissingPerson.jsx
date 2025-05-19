import { useState, useEffect, useMemo, useRef } from "react";
import {
  Card,
  CardContent,
  Typography,
  Container,
  Box,
  CardActionArea,
  Grid,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import Marquee from "react-fast-marquee";

import MissingPersonMap from "./MissingPersonMap";
import worldMapBackground from "/assets/background_image/world-map-background.jpg";
import Footer from "../../../../components/Footer";

function MissingPerson() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const [missingPersons, setMissingPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const mapContainerRef = useRef(null);
  const [userRole, setUserRole] = useState(null);
  const [userID, setUserID] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [agency, setAgency] = useState(null);
  const [selectiveMissingPersons, setSelectiveMissingPersons] = useState([]);

  useEffect(() => {
    // Check if user is logged in by retrieving from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedData = JSON.parse(userData);
      setUserRole(parsedData.role);
      setUserID(parsedData.user_id);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    const fetchAgencyDetails = async () => {
      try {
        const response = await fetch(
          `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/agency-profiles/${userID}/`
        );
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching agency details:", error);
        return null;
      }
    };

    const fetchMissingPersons = async () => {
      try {
        // Fetch agency details once
        const agencyData = await fetchAgencyDetails();
        if (!agencyData) return;

        setAgency(agencyData);
        console.log("Agency data:", agencyData);

        const res = await fetch(
          "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/missing-persons/"
        );
        const data = await res.json();
        console.log("Missing persons data:", data);

        // Fetch detailed data for each person in parallel
        const personDetailsPromises = data.map(async (person) => {
          try {
            const response = await fetch(
              `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/missing-persons/${person.id}/`
            );
            const personData = await response.json();
            console.log(`Details for person ID ${person.id}:`, personData);

            return {
              ...person,
              person_photo: personData.person_photo || "",
              description: personData.description || "",
              identification_marks: personData.identification_marks || "",
              identity_card_image: personData.identity_card_image || "",
              state: personData.state || "",
            };
          } catch (err) {
            console.error(`Failed to fetch details for person ID ${person.id}:`, err);
            return {
              ...person,
              person_photo: "",
              description: "",
              identification_marks: "",
              identity_card_image: "",
              state: ""
            };
          }
        });

        // Wait for all the details to be fetched
        const personsWithDetails = await Promise.all(personDetailsPromises);

        // Filter based on the agency's state
        const filteredPersons = personsWithDetails.filter((person) =>
          person.state?.toLowerCase() === agencyData?.state?.toLowerCase()
        );

        setMissingPersons(personsWithDetails);
        setSelectiveMissingPersons(filteredPersons);

        console.log("Filtered missing persons based on agency state:", filteredPersons);
      } catch (err) {
        console.error("Failed to fetch missing persons:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMissingPersons();
  }, [userID]);

  const getMissingDate = (dateString) => {
    const dateObj = new Date(dateString);
    const date = dateObj.toISOString().split("T")[0];
    const time = dateObj.toTimeString().split(" ")[0];

    return { date, time };
  };

  const topPersonsByType = useMemo(() => {
    const grouped = selectiveMissingPersons.reduce((acc, person) => {
      acc[person.eventtype] = acc[person.eventtype] || [];
      acc[person.eventtype].push(person);
      return acc;
    }, {});

    return Object.values(grouped).flatMap((group) => group.slice(0, 5));
  }, [selectiveMissingPersons]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(rgba(255,255,255,0.95), rgba(255,255,255,0.95)), url(${worldMapBackground})`,
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        paddingTop: "100px",
      }}
    >
      <Container maxWidth="xl" sx={{ py: 10 }}>
        <Grid container spacing={3}>
          {/* Map and Sidebar */}
          <Grid item xs={12} md={12} lg={8} sx={{ height: "100%" }}>
                <Box sx={{ height: 500 }} ref={mapContainerRef}>
                  {loading ? (
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      height="100%"
                      sx={{
                        backgroundColor: "rgb(255, 255, 255)",
                        borderRadius: 3,
                      }}
                      >
                      <Typography>Loading map...</Typography>
                    </Box>
                  ) : (
                    <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    height="100%"
                    sx={{
                      backgroundColor: "rgb(255, 255, 255)",
                      borderRadius: 3,
                      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                      position: "relative",
                    }}
                    >
                      <MissingPersonMap
                        persons={selectiveMissingPersons}
                        selectedPerson={selectedPerson}
                      />
                    </Box>
                  )}
                </Box>
          </Grid>

          {/* Person Cards */}
          <Grid item xs={12} md={12} lg={4} sx={{ height: "100%" }}>
            <Card elevation={3} sx={{ height: 500, overflowY: "auto", borderRadius: 3 }}>
              <CardContent>
                {loading ? (
                  <Typography align="center">Loading data...</Typography>
                ) : missingPersons.length === 0 ? (
                  <Typography align="center">No missing persons found.</Typography>
                ) : (
                  <Grid container spacing={2}>
                    {topPersonsByType.map((person) => (
                      <Grid item xs={12} key={person.id}>
                        <Card
                          onClick={() => setSelectedPerson(person)}
                          sx={{
                            backgroundColor: "#F8FAFB",
                            display: "flex",
                            alignItems: "center",
                            p: 2,
                            cursor: "pointer",
                            "&:hover": {
                              boxShadow: 4,
                              transform: "scale(1.02)",
                            },
                            transition: "0.2s",
                          }}
                        >
                          <Box
                            component="img"
                            src={person.person_photo ? `https://res.cloudinary.com/doxgltggk/${person.person_photo}` : "/assets/person.png"}
                            alt={person.full_name}
                            sx={{
                              width: 60,
                              height: 60,
                              borderRadius: "50%",
                              objectFit: "cover",
                              mr: 2,
                              boxShadow: 1,
                            }}
                          />
                          <Box>
                            <Typography fontWeight="bold">{person.full_name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Missing: {getMissingDate(person.created_at).date} at {getMissingDate(person.created_at).time}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Location: {person.last_seen_location.split(",").slice(0, 2).join(", ")}
                            </Typography>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </Box>
  );
}

export default MissingPerson;