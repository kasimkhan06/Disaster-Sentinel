import { useState, useEffect, useMemo, useRef } from "react";
import {
  Card,
  CardContent,
  Typography,
  Container,
  Box,
  Grid,
  useMediaQuery,
  Autocomplete,
  TextField,
  InputLabel,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
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
  const mapRef = useRef();
  const personsPerPage = 4;

  const [missingPersons, setMissingPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const mapContainerRef = useRef(null);
  const [userRole, setUserRole] = useState(null);
  const [userID, setUserID] = useState(null);
  const [agency, setAgency] = useState(null);
  const [selectiveMissingPersons, setSelectiveMissingPersons] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [stateDistricts, setStateDistricts] = useState({});
  const [errors, setErrors] = useState({});
  const [districts, setDistricts] = useState([]);
  const [searchName, setSearchName] = useState(null);
  const isBelow = useMediaQuery(theme.breakpoints.down("md"));
  const [userPermissions, setUserPermissions] = useState(null);
  const [personPage, setPersonPage] = useState(1);
  const [isNotLoggedIn, setIsNotLoggedIn] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });


  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedData = JSON.parse(userData);
      setUserRole(parsedData.role);
      // Check if user has permissions and is a regular user
      if (
        parsedData.role === "user" &&
        parsedData.permissions &&
        parsedData.permissions.length > 0
      ) {
        // Set userID to the first agency's ID in permissions array
        setUserID(parsedData.permissions[0].agency.id);
        setSelectedState(localStorage.getItem("agencyState") || "");
        console.log("Agency State(used by volunteer):", selectedState);
      } else {
        // Otherwise set to the normal user_id
        setUserID(parsedData.user_id);
        setSelectedState(parsedData.state || "");
      }
      console.log("User State1:", selectedState);
      console.log("User Data:", parsedData);
      setIsAuthenticated(true);
      setIsNotLoggedIn(false);
    } else {
      console.log("No user data found in localStorage");
      setIsNotLoggedIn(true);
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    if (isNotLoggedIn && !isAuthenticated) {
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      console.log("redirectAfterLogin", window.location.pathname);
      setIsNotLoggedIn(true);
      setIsAuthenticated(false);
      navigate("/login");
      return;
    }
  }, [isNotLoggedIn, isAuthenticated, navigate]);

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
            sortedStates.forEach((state) => {
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
        };

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
    console.log("Selected District:", value.props);
    const val = value.props.value;
    setSelectedDistrict(val || "");

    if (val && selectedState) {

      if (val === "all") {
        setSelectedDistrict(""); // Reset district if "all" is selected
        setSelectiveMissingPersons(missingPersons.filter(
          (person) =>
            person.state?.toLowerCase() === selectedState.toLowerCase() &&
            person.is_found === false
        ));
      } else {
        const filtered = missingPersons.filter(
          (person) =>
            person.state?.toLowerCase() === selectedState.toLowerCase() &&
            person.district?.toLowerCase() === val.toLowerCase() &&
            person.is_found === false
        );
        setSelectiveMissingPersons(filtered);
      }
    } else if (agency?.district && agency?.state) {
      const fallbackFiltered = missingPersons.filter(
        (person) =>
          person.state?.toLowerCase() === agency.state.toLowerCase() &&
          person.district?.toLowerCase() === agency.district.toLowerCase() &&
          person.is_found === false
      );
      setSelectiveMissingPersons(fallbackFiltered);
    } else {
      const allUnfound = missingPersons.filter(
        (person) => person.is_found === false
      );
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
            console.error(
              `Failed to fetch details for person ID ${person.id}:`,
              err
            );
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

  const handlePersonSearch = (name) => {
    console.log("Search Name:", name);
    setSearchName(name);

    const foundPerson = selectiveMissingPersons.find((p) => p.full_name.toUpperCase() === name);
    if (foundPerson) {
      setSelectedPerson(foundPerson); // highlights person card
      scrollToMap();
      flyToPerson(foundPerson); // animate map fly
    }
  };

  const flyToPerson = (person) => {
    if (mapRef.current && person.latitude && person.longitude) {
      mapRef.current.flyTo([person.latitude, person.longitude], 14, {
        animate: true,
        duration: 1.5,
      });
    }
  };

  const scrollToMap = () => {
    if (mapContainerRef.current) {
      mapContainerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const handlePersonPageChange = (event, value) => {
    setPersonPage(value);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92)), url(${worldMapBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        margin: 0,
        zIndex: 0,
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        overflowY: "auto",
      }}
    >
      <Box>
        <Box
          sx={{
            maxWidth: "1000px",
            marginX: "auto",
            px: { xs: 2, sm: 3 },
            pt: { xs: 2, sm: 3 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              pt: { xs: 1, sm: 2 },
            }}
          >
            <Typography
              align="center"
              sx={{
                mt: { xs: 8, sm: 5, md: 5, lg: 5 },
                p: 2,
                fontSize: {
                  xs: "1.2rem",
                  sm: "1.3rem",
                  md: "1.4rem",
                  lg: "1.5rem",
                },
                fontWeight: "bold",
                textTransform: "uppercase",
                color: "rgba(0, 0, 0, 0.87)",
                zIndex: 1,
              }}
            >
              Missing Persons
            </Typography>
          </Box>
          <Box className="controls" sx={{ mb: 3 }}>
            <Grid
              container
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
            >
              {/* Search Section */}
              <Grid
                item
                xs={12}
                md={6}
                sx={{
                  display: "flex",
                  justifyContent: {
                    xs: "center",
                    md: "center",
                    lg: "flex-start",
                  },
                  mt: { xs: 2, md: 2 },
                }}
              >
                <Box
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.97)",
                    borderRadius: "8px",
                    width: "100%",
                    maxWidth: 300,
                  }}
                >
                  <Autocomplete
                    options={selectiveMissingPersons
                      .filter((p) => !p.is_found)
                      .map((p) => p.full_name.toUpperCase())}
                    value={searchName ? searchName.toUpperCase() : null}
                    onChange={(e, value) => handlePersonSearch(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Search Name"
                        variant="outlined"
                        sx={{
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                          "&:hover": {
                            boxShadow: "0 6px 8px rgba(0, 0, 0, 0.15)",
                          },
                        }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <InputAdornment position="end">
                              <SearchIcon fontSize="medium" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                    size="small"
                  />
                </Box>
              </Grid>

              {/* Filters Section */}
              <Grid
                item
                xs={12}
                md={6}
                sx={{
                  display: "flex",
                  justifyContent: {
                    xs: "center",
                    md: "center",
                    lg: "flex-end",
                  }, // centered for md
                  mt: { xs: 2, md: 2 },
                }}
              >
                <Box
                  sx={{
                    minWidth: 140,
                    backgroundColor: "white",
                    boxShadow: "2px 2px 2px #E8F1F5",
                    position: "relative",
                    paddingX: 1,
                    borderRadius: 1,
                  }}
                >
                  <FormControl fullWidth>
                    <Select
                      labelId="district-select-label"
                      value={
                        districts.includes(selectedDistrict)
                          ? selectedDistrict
                          : null
                      }
                      onChange={handleDistrictChange}
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected || selected === "all") {
                          return <em style={{ color: "gray" }}>District</em>;
                        }
                        return selected;
                      }}
                      sx={{
                        border: "none",
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                        "& .MuiSelect-select": {
                          padding: "10px 14px",
                        },
                        fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                        color: selectedDistrict ? "inherit" : "gray",
                      }}
                    >
                      <MenuItem value="all">
                        <em>All Districts</em>
                      </MenuItem>
                      {districts.map((district, idx) => (
                        <MenuItem key={idx} value={district}>
                          {district}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ py: 5 }}>
        <Grid
          container
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: isMobile ? "row" : "row",
            maxWidth: { xs: "85%", md: "850px", lg: "1400px" },
            m: "auto",
            mt: -3,
          }}
        >
          {/* Map and Sidebar */}
          <Grid
            item
            xs={12}
            md={12}
            lg={6}
            sx={{ height: "100%", mx: "auto", mb: 4 }}
          >
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

          <Grid item xs={12} md={12} lg={4} sx={{ height: "100%", mx: "auto" }}>
            <Card
              elevation={3}
              sx={{
                height: 500,
                display: "flex",
                flexDirection: "column",
                borderRadius: 3,
              }}
            >
              {/* Scrollable Content */}
              <CardContent
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  paddingBottom: 0, // so that content doesn't get hidden under pagination
                }}
              >
                {loading ? (
                  <Typography align="center">Loading data...</Typography>
                ) : missingPersons.length === 0 ? (
                  <Typography align="center">No missing persons found.</Typography>
                ) : (
                  <Grid container spacing={2}>
                    {topPersonsByType
                      .slice((personPage - 1) * personsPerPage, personPage * personsPerPage)
                      .map((person) => (
                        <Grid item xs={12} key={person.id}>
                          <Card
                            onClick={() => {
                              setSelectedPerson(person);
                              flyToPerson(person);
                              scrollToMap();
                            }}
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
                              src={
                                person.person_photo
                                  ? `https://res.cloudinary.com/doxgltggk/${person.person_photo}`
                                  : "/assets/person.png"
                              }
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
                              <Typography fontWeight="bold">
                                {person.full_name.toUpperCase()}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Missing: {getMissingDate(person.created_at).date} at{" "}
                                {getMissingDate(person.created_at).time}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Location:{" "}
                                {person.last_seen_location
                                  .split(",")
                                  .slice(0, 2)
                                  .join(", ")}
                              </Typography>
                            </Box>
                          </Card>
                        </Grid>
                      ))}
                  </Grid>
                )}
              </CardContent>

              {/* Pagination at Bottom of Card */}
              {topPersonsByType.length > 0 && (
                <Box
                  sx={{
                    p: 1,
                    backgroundColor: "#fff",
                  }}
                >
                  <Pagination
                    count={Math.ceil(topPersonsByType.length / personsPerPage)}
                    page={personPage}
                    onChange={handlePersonPageChange}
                    sx={{ display: "flex", justifyContent: "center" }}
                  />
                </Box>
              )}
            </Card>
          </Grid>

        </Grid>
      </Container>
      <Footer />
    </Box>
  );
}

export default MissingPerson;
