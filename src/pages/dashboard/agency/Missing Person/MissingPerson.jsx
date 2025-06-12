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
  Autocomplete,
  TextField,
  InputLabel,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

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
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [stateDistricts, setStateDistricts] = useState({});
  const [errors, setErrors] = useState({});
  const [districts, setDistricts] = useState([]);
  const isBelow = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedData = JSON.parse(userData);
      setUserRole(parsedData.role);
      setUserID(parsedData.user_id);
      setSelectedState(parsedData.state || "");
      console.log("User State1:", selectedState);
      console.log("User Data:", parsedData);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    const fetchExcelFile = async () => {
      try {
        const response = await fetch("/assets/District_Masters.xlsx");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blob = await response.blob();
        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            const tempStateDistricts = {};
            jsonData.forEach((row) => {
              const state = row["State Name"]?.trim();
              const district = row["District Name"]?.trim();
              if (state && district) {
                if (!tempStateDistricts[state]) {
                  tempStateDistricts[state] = [];
                }
                if (!tempStateDistricts[state].includes(district)) {
                  tempStateDistricts[state].push(district);
                }
              }
            });
            // Sort states alphabetically
            const sortedStates = Object.keys(tempStateDistricts).sort();
            const sortedStateDistricts = {};
            sortedStates.forEach(state => {
              sortedStateDistricts[state] = tempStateDistricts[state].sort();
            });

            setStateDistricts(sortedStateDistricts);
            console.log("State Districts:", sortedStateDistricts);

            // Set districts based only on the agency's state
            if (selectedState && stateDistricts[selectedState]) {
              setDistricts(stateDistricts[selectedState]);
            } else {
              setDistricts([]);
            }

          } catch (parseError) {
            console.error("Error parsing Excel data:", parseError);
          }
        };
        reader.onerror = (error) => {
          console.error("FileReader error:", error);
        }

        reader.readAsArrayBuffer(blob);
      } catch (error) {
        console.error("Error fetching the Excel file:", error);
      }
    };

    fetchExcelFile();
  }, []);

  useEffect(() => {
    if (selectedState && stateDistricts[selectedState]) {
      setDistricts(stateDistricts[selectedState]);
    }
  }, [selectedState, stateDistricts]);


  const handleDistrictChange = (event, value) => {
    setSelectedDistrict(value || "");

    if (value && selectedState) {
      const filtered = missingPersons.filter(
        (person) =>
          person.state?.toLowerCase() === selectedState.toLowerCase() &&
          person.district?.toLowerCase() === value.toLowerCase() &&
          person.is_found === false
      );
      setSelectiveMissingPersons(filtered);
    } else if (agency?.district && agency?.state) {
      const fallbackFiltered = missingPersons.filter(
        (person) =>
          person.state?.toLowerCase() === agency.state.toLowerCase() &&
          person.district?.toLowerCase() === agency.district.toLowerCase() &&
          person.is_found === false
      );
      setSelectiveMissingPersons(fallbackFiltered);
    } else {
      const allUnfound = missingPersons.filter((person) => person.is_found === false);
      setSelectiveMissingPersons(allUnfound);
    }
  };

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
        // Fetch agency details
        const agencyData = await fetchAgencyDetails();
        if (!agencyData) return;

        setAgency(agencyData);

        const res = await fetch(
          "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/missing-persons/"
        );
        const data = await res.json();

        // Fetch detailed data for each person in parallel
        const personDetailsPromises = data.map(async (person) => {
          try {
            const response = await fetch(
              `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/missing-persons/${person.id}/`
            );
            const personData = await response.json();

            return {
              ...person,
              person_photo: personData.person_photo || "",
              description: personData.description || "",
              identification_marks: personData.identification_marks || "",
              identity_card_image: personData.identity_card_image || "",
              state: personData.state || "",
              district: personData.district || "",
            };
          } catch (err) {
            console.error(`Failed to fetch details for person ID ${person.id}:`, err);
            return {
              ...person,
              person_photo: "",
              description: "",
              identification_marks: "",
              identity_card_image: "",
              state: "",
              district: "",
            };
          }
        });

        const personsWithDetails = await Promise.all(personDetailsPromises);
        setMissingPersons(personsWithDetails); // store all data

        const defaultState = agencyData?.state?.toLowerCase();
        const defaultDistrict = agencyData?.district?.toLowerCase();

        // Set selectedDistrict as default
        if (agencyData?.district) {
          setSelectedDistrict(agencyData.district);
        }

        // Filter by agency state + district
        const filteredPersons = personsWithDetails.filter(
          (person) =>
            person.state?.toLowerCase() === defaultState &&
            person.district?.toLowerCase() === defaultDistrict &&
            person.is_found === false
        );

        setSelectiveMissingPersons(filteredPersons);
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
        background: `
              linear-gradient(rgba(255, 255, 255, 0.90), rgba(255, 255, 255, 0.90)),
              url(${worldMapBackground})
            `,
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        paddingTop: "100px",
      }}
    >
      <Typography
        align="center"
        sx={{
          p: 2,
          fontSize: {
            xs: "1.2rem",
            sm: "1.2rem",
            md: isBelow ? "1.2rem" : "1.4rem",
            lg: isBelow ? "1.2rem" : "1.4rem",
          },
          fontWeight: "bold",
          textTransform: "uppercase",
          color: "rgba(0, 0, 0, 0.87)",
          position: "relative",
          zIndex: 1,
        }}
      >
        Missing Persons
      </Typography>
      <Grid item xs={12} sm={6} md={4} lg={3}
        sx={{
          padding: "0 15px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}>
        <Box
          sx={{
            padding: "12px 15px",
            textAlign: "left",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            backgroundColor: "rgba(255, 255, 255, 0.97)",
            position: "relative",
            borderRadius: "8px",
            minWidth: "20px",
            width: "15%",
            transition: "all 0.3s ease",
            mt: 1,
            "&:hover": {
              boxShadow: "0 6px 8px rgba(0, 0, 0, 0.15)",
            },
          }}
        >
          <InputLabel
            sx={{
              position: "absolute",
              top: -5,
              left: 16,
              padding: "0 2px",
              fontSize: { xs: "0.55rem", sm: "0.6rem", md: "0.75rem" },
              color: "text.secondary",
              fontStyle: "italic",
            }}
          >
            District
          </InputLabel>
          <Autocomplete
            options={districts}
            value={districts.includes(selectedDistrict) ? selectedDistrict : null}
            onChange={handleDistrictChange}
            isOptionEqualToValue={(option, value) => option === value || value === ""}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="standard"
                error={!!errors.district}
                placeholder="Select District"
                InputProps={{ ...params.InputProps, disableUnderline: true }}
              />
            )}
            size="small"
            sx={{
              width: "100%",
              mt: 1,
              "& .MuiAutocomplete-inputRoot": {
                padding: "4px 6px",
              },
            }}
          />
          {errors.district && (
            <Typography
              color="error"
              variant="caption"
              display="block"
              textAlign="left"
              mt={0.5}
            >
              {errors.district}
            </Typography>
          )}
        </Box>
      </Grid>

      <Container maxWidth="xl" sx={{ py: 5 }}>
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
                            <Typography fontWeight="bold">{person.full_name.toUpperCase()}</Typography>
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