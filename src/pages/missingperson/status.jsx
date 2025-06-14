import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  Autocomplete,
  CircularProgress,
  Alert,
} from "@mui/material";
import worldMapBackground from "../../../public/assets/background_image/world-map-background.jpg";
import Footer from "../../components/Footer";

const API_BASE_URL =
  "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api";

const mapApiResponseToSelectedPerson = (apiData) => {
  if (!apiData) return null;

  if (apiData.is_found) {
    if (apiData.agency_found_location && apiData.agency_current_location_of_person) {
      console.log("mapApiResponseToSelectedPerson: API data indicates person is found.");
      apiData.additional_info = `FOUND at ${apiData.agency_found_location}, the person is currently kept at ${apiData.agency_current_location_of_person}.`.trim();
    }
    else {
      console.log("mapApiResponseToSelectedPerson: API data indicates person is found.");
      apiData.additional_info = `${apiData.additional_info}`.trim();
    }
  }

  const isMarkedFound = typeof apiData.additional_info === "string" &&
    apiData.additional_info.trim().startsWith("FOUND");
  console.log(
    "mapApiResponseToSelectedPerson: isMarkedFound status determined as:",
    isMarkedFound
  );

  console.log(
    "mapApiResponseToSelectedPerson: Mapping API data to selected person format:",
    JSON.parse(JSON.stringify(apiData))
  );

  return {
    id: apiData.id,
    name: apiData.full_name || "N/A",
    age: apiData.age || "N/A",
    gender: apiData.gender || "N/A",
    status: isMarkedFound ? "Found" : "Missing",
    disasterType: apiData.disaster_type || "N/A",
    contactInfo: apiData.reporter_contact_info || "N/A",
    additional_info: apiData.additional_info || "",
    displayadditional_info: apiData.additional_info || "",
    lastSeen: apiData.last_seen_location || "N/A",
    photo: apiData.person_photo || null,
    isMarkedFound,
    description: apiData.description || "N/A",
  };
};

const StatusTracking = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const [selectedPerson, setSelectedPerson] = useState(null);
  const [editedInfo, setEditedInfo] = useState({ additional_info: "" });
  const [reportList, setReportList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentStatus, setCurrentStatus] = useState("Missing");

  useEffect(() => {
    let userFromStorage = null;
    let authenticated = false;
    try {
      const storedUserDetails = localStorage.getItem("user");
      if (storedUserDetails) {
        userFromStorage = JSON.parse(storedUserDetails);
        if (userFromStorage && userFromStorage.email) {
          authenticated = true;
        } else {
          localStorage.removeItem("user");
        }
      }
    } catch (parseError) {
      console.error(
        "Error parsing user details from localStorage:",
        parseError
      );
      localStorage.removeItem("user");
    }
    setCurrentUser(userFromStorage);
    setUserId(userFromStorage.user_id);
    setIsAuthenticated(authenticated);
    setAuthLoading(false);
  }, []);

  const currentReporterEmail = currentUser ? currentUser.email : null;

  useEffect(() => {
    console.log("Current User:", currentUser);
    if (!currentUser) return;
    if (currentUser.isMarkedFound) {
      setCurrentStatus("Found");
    }
  }, [currentUser]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && currentReporterEmail) {
      const fetchReportList = async () => {
        setLoadingList(true);
        setError("");
        try {
          const response = await fetch(`${API_BASE_URL}/missing-persons/`);
          if (!response.ok) {
            throw new Error(
              `HTTP error! status: ${response.status
              }, Text: ${await response.text()}`
            );
          }
          let rawData = await response.json();
          let processedData = rawData.filter(
            (person) =>
              person.reporter_email &&
              typeof person.reporter_email === "string" &&
              person.reporter_email.toLowerCase() ===
              currentReporterEmail.toLowerCase()
          );

          console.log(
            "Fetched raw data from API:",
            JSON.parse(JSON.stringify(processedData))
          );
          const options = processedData.map((person) => ({
            label: `${person.full_name}`,
            id: person.id,
            isFound: person.is_found,
          }));
          setReportList(options);
          console.log(
            "Fetched report list successfully:",
            JSON.parse(JSON.stringify(reportList))
          );
        } catch (err) {
          console.error("Error fetching report list:", err);
          setError(`Failed to load report list: ${err.message}.`);
        } finally {
          setLoadingList(false);
        }
      };
      fetchReportList();
    } else if (!authLoading && !isAuthenticated) {
      setReportList([]);
    }
  }, [currentReporterEmail, isAuthenticated, authLoading]);

  const handleSearch = async (selectedOption) => {
    if (!selectedOption || !selectedOption.id) {
      setSelectedPerson(null);
      setEditedInfo({ additional_info: "" }); // Reset editedInfo when selection is cleared
      setError("");
      setSuccessMessage("");
      return;
    }
    const personId = selectedOption.id;
    setLoadingDetails(true);
    setSelectedPerson(null);
    setEditedInfo({ additional_info: "" }); // Reset editedInfo during new search
    setError("");
    setSuccessMessage("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/missing-persons/${personId}/`
      );
      if (!response.ok) {
        if (response.status === 404)
          throw new Error(`Report with ID ${personId} not found.`);
        throw new Error(
          `HTTP error! status: ${response.status
          }, Text: ${await response.text()}`
        );
      }
      const detailedData = await response.json();
      const mappedData = mapApiResponseToSelectedPerson(detailedData);
      setSelectedPerson(mappedData);
      console.log(
        "Fetched person details successfully:",
        JSON.parse(JSON.stringify(mappedData))
      );
      setEditedInfo({ additional_info: mappedData?.additional_info || "" });
    } catch (err) {
      console.error("Error fetching person details:", err);
      setError(`Failed to load details: ${err.message}`);
      setSelectedPerson(null);
      setEditedInfo({ additional_info: "" });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleEditChange = (e) => {
    setEditedInfo({ ...editedInfo, [e.target.name]: e.target.value });
  };

  const updateReportInfo = async (reportId, payload) => {
    if (!reportId) {
      console.error("updateReportInfo: reportId is missing.");
      return;
    }
    console.log(
      `updateReportInfo: Attempting to update report ID: ${reportId} with payload:`,
      JSON.parse(JSON.stringify(payload))
    );
    setLoadingUpdate(true);
    setError("");
    setSuccessMessage("");

    const formData = new FormData();
    for (const key in payload) {
      if (payload.hasOwnProperty(key)) {
        console.log(
          `updateReportInfo: Appending ${key} to FormData with value:`,
          payload[key]
        );
        formData.append(key, payload[key]);
      }
    }

    try {
      const response = await fetch(
        `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/missing-persons/${reportId}/update-info/`,
        {
          method: "PATCH",
          body: formData,
        }
      );

      console.log(
        "updateReportInfo: Raw API Response Status:",
        response.status
      );
      const responseContentType = response.headers.get("content-type");
      console.log(
        "updateReportInfo: Raw API Response Content-Type Header:",
        responseContentType
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("updateReportInfo: API Error Response Text:", errorText);
        let errorData;
        try {
          if (
            responseContentType &&
            responseContentType.includes("application/json")
          ) {
            errorData = JSON.parse(errorText);
          } else {
            errorData = {
              detail:
                errorText ||
                `HTTP error ${response.status}. Server returned non-JSON error.`,
            };
          }
        } catch (e) {
          errorData = {
            detail:
              errorText ||
              `HTTP error ${response.status}. Failed to parse error response.`,
          };
        }
        const errorDetail = errorData.detail || JSON.stringify(errorData);
        throw new Error(errorDetail);
      }

      let updatedDataFromServer;
      if (
        responseContentType &&
        responseContentType.includes("application/json")
      ) {
        updatedDataFromServer = await response.json();
      } else {
        const responseText = await response.text();
        console.warn(
          "updateReportInfo: API response was OK but not 'application/json'. Response Text:",
          responseText
        );
        if (responseText) {
          try {
            updatedDataFromServer = JSON.parse(responseText);
          } catch (e) {
            console.error(
              "updateReportInfo: Could not parse non-JSON OK response."
            );
          }
        }
        if (
          !updatedDataFromServer &&
          (response.status === 200 || response.status === 204)
        ) {
          console.log(
            "updateReportInfo: Received OK/No Content but no JSON body. Re-fetching details for consistency."
          );
          const refetchResponse = await fetch(
            `${API_BASE_URL}/missing-persons/${reportId}/`
          );
          if (refetchResponse.ok) {
            updatedDataFromServer = await refetchResponse.json();
            console.log(updatedDataFromServer);
          } else {
            console.error(
              "Failed to re-fetch report details after update. Proceeding with optimistic update using current state as base."
            );
            updatedDataFromServer = { ...selectedPerson };
          }
        }
      }
      console.log(
        "updateReportInfo: API Response JSON (updatedDataFromServer):",
        JSON.parse(JSON.stringify(updatedDataFromServer))
      );

      // ***** KEY FIX REFINED *****
      let dataForMapping;
      if (updatedDataFromServer) {
        dataForMapping = { ...updatedDataFromServer };
        if (payload.hasOwnProperty("additional_info")) {
          console.log(
            "updateReportInfo: Overriding/setting additional_info in dataForMapping with payload's value:",
            payload.additional_info
          );
          dataForMapping.additional_info = payload.additional_info;
        }
      } else {
        console.warn(
          "updateReportInfo: No data in server response body and re-fetch failed. Optimistically using payload for UI update."
        );
        dataForMapping = { ...selectedPerson, ...payload };
        if (payload.hasOwnProperty("additional_info")) {
          dataForMapping.additional_info = payload.additional_info;
        }
      }
      // ***** END KEY FIX REFINED *****
      console.log(
        "updateReportInfo: Data being sent to mapApiResponseToSelectedPerson:",
        JSON.parse(JSON.stringify(dataForMapping))
      );

      const mappedData = mapApiResponseToSelectedPerson(dataForMapping);
      setSelectedPerson(mappedData);
      setEditedInfo({ additional_info: mappedData?.additional_info || "" });

      console.log(
        "updateReportInfo: selectedPerson state updated to:",
        JSON.parse(JSON.stringify(mappedData))
      );
      setSuccessMessage("Report updated successfully!");
    } catch (err) {
      console.error("updateReportInfo: Error during report update:", err);
      setError(`Update failed: ${err.message}`);
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleSaveChanges = () => {
    if (!selectedPerson) return;
    console.log(
      "handleSaveChanges: Current editedInfo.additional_info:",
      editedInfo.additional_info
    );
    updateReportInfo(selectedPerson.id, {
      reporter_id: userId,
      additional_info: editedInfo.additional_info,
    }).then(() => {
      setSuccessMessage("Changes saved successfully!");
      console.log(
        "handleSaveChanges: Changes saved successfully. Updated additional_info:",
        editedInfo.additional_info
      );
    });
  };

  const handleAdditionalInfo = () => {
    if (!selectedPerson || selectedPerson.isMarkedFound) return;

    const baseInfo = selectedPerson.additional_info?.replace(/^FOUND\s*/, "") || "";
    const newadditional_info = `FOUND ${baseInfo}`.trim();

    updateReportInfo(selectedPerson.id, {
      reporter_id: userId,
      additional_info: newadditional_info,
    });
  };

  const handleMarkFound = async () => {
    if (!selectedPerson) {
      setError("No person selected to mark as found.");
      return;
    }
    if (selectedPerson.isMarkedFound) {
      setSuccessMessage("This person is already marked as found.");
      return;
    }
    if (!userId) {
      setError("User not identified. Cannot mark as found.");
      return;
    }

    setLoadingUpdate(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/missing-persons/${selectedPerson.id}/reporter-mark-found/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reporter_id: parseInt(userId) }),
        }
      );

      const data = await response.json();
      handleAdditionalInfo();
      console.log(
        "handleMarkFound: API Response Data:",
        JSON.parse(JSON.stringify(data))
      );
      console.log(
        "handleMarkFound: API Response Status:",
        response.status
      );

      if (!response.ok) {
        const errorMsg = data?.detail || data?.message || "Failed to mark as found.";
        throw new Error(errorMsg);
      }

      const mappedData = mapApiResponseToSelectedPerson(data);
      setSelectedPerson(mappedData);
      setSuccessMessage("Person marked as found successfully!");
      console.log(
        "handleMarkFound: Person marked as found. Updated selectedPerson state:",
        JSON.parse(JSON.stringify(mappedData))
      );
    } catch (err) {
      setError(`Failed to mark as found: ${err.message}`);
    } finally {
      setLoadingUpdate(false);
    }
  };

  if (authLoading) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "calc(100vh - 64px)",
          pt: 8,
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container sx={{ pt: 8, textAlign: "center" }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Login is compulsory to view this page. Please log in.
        </Alert>
      </Container>
    );
  }

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
        zIndex: 0,
      }}
    >
      <Container
        maxWidth="md"
        sx={{ mt: { xs: 2, sm: 4, md: 7 }, pb: 4, pt: { xs: 2, sm: 4 } }}
      >
        {error && (
          <Alert
            severity="error"
            onClose={() => setError("")}
            sx={{ mb: 2, position: "sticky", top: "70px", zIndex: 1000 }}
          >
            {error}
          </Alert>
        )}
        {successMessage && (
          <Alert
            severity="success"
            onClose={() => setSuccessMessage("")}
            sx={{ mb: 2, position: "sticky", top: "70px", zIndex: 1000 }}
          >
            {successMessage}
          </Alert>
        )}

        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
          <Autocomplete
            id="person-search-input"
            options={reportList}
            getOptionLabel={(option) =>
              option && option.label ? option.label : ""
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            loading={loadingList}
            value={reportList.find((p) => p.id === selectedPerson?.id) || null}
            onChange={(event, newValue) => handleSearch(newValue)}
            sx={{ width: { xs: "90%", sm: 500, md: 400 } }}
            renderOption={(props, option) => (
              <Box
                component="li"
                {...props}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  px: 1,
                }}
              >
                <Box>{option.label}</Box>
                <Box
                  sx={{
                    color: option.isFound ? "green" : "orange",
                    fontWeight: 500,
                    backgroundColor: option.isFound ? "#e8f5e9" : "#fff3e0",
                    borderRadius: "4px",
                    border: `1px solid ${option.isFound ? "#c8e6c9" : "#ffccbc"}`,
                    padding: "2px 6px",
                    minWidth: "70px",
                    textAlign: "center",
                    marginLeft: "auto",
                  }}
                >
                  {option.isFound ? "Found" : "Missing"}
                </Box>
              </Box>
            )}

            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search Your Reported Missing Persons"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingList ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                    borderRadius: "3px",
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
                    "& fieldset": { borderColor: "transparent" },
                    "&:hover fieldset": { borderColor: "rgba(0, 0, 0, 0.1)" },
                    "&.Mui-focused fieldset": {
                      borderColor: "primary.main",
                      borderWidth: "1px",
                    },
                  },
                }}
              />
            )}
          />

        </Box>

        {loadingDetails && (
          <CircularProgress sx={{ display: "block", margin: "20px auto" }} />
        )}

        {!loadingDetails && selectedPerson && (
          <Card
            sx={{
              maxWidth: 600,
              mx: "auto",
              p: 3,
              mt: 0,
              borderRadius: 2,
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography variant="h6" align="center" gutterBottom>
              Missing Person Details
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center",
                mt: 2,
                gap: { xs: 2, sm: 3 },
              }}
            >
              <Avatar
                src={
                  selectedPerson.photo
                    ? `https://res.cloudinary.com/doxgltggk/${selectedPerson.photo}`
                    : undefined
                }
                alt={selectedPerson.name}
                sx={{
                  width: 100,
                  height: 100,
                  alignSelf: "center",
                  border: "2px solid lightgray",
                }}
              />
              <Box
                sx={{ textAlign: { xs: "center", sm: "left" }, flexGrow: 1 }}
              >
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
                  <strong>Disaster Context:</strong>{" "}
                  {selectedPerson.disasterType}
                </Typography>
                <Typography variant="body1">
                  <strong>Last Seen:</strong> {selectedPerson.lastSeen}
                </Typography>
                <Typography variant="body1">
                  <strong>Reporter Contact:</strong>{" "}
                  {selectedPerson.contactInfo}
                </Typography>
                <Typography variant="body1">
                  <strong>Description:</strong> {selectedPerson.description}
                </Typography>
                {/* MODIFICATION START: Display additional_info from editedInfo for live updates */}
                <Typography variant="body1" sx={{ wordBreak: "break-word" }}>
                  <strong>Additional Info:</strong>{" "}
                  {selectedPerson.additional_info}
                </Typography>
                {/* MODIFICATION END */}
              </Box>
            </Box>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
                Status:
                <Box
                  component="span"
                  sx={{
                    color:
                      selectedPerson.status === "Found" ? "green" : "orange",
                    ml: 1,
                  }}
                >
                  {selectedPerson.status}
                </Box>
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                margin="normal"
                label="Additional Information"
                name="additional_info"
                multiline
                rows={2}
                value={editedInfo.additional_info}
                onChange={handleEditChange}
                InputLabelProps={{ shrink: true }}
                disabled={loadingUpdate}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 3,
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Button
                disableRipple
                // variant="contained"
                // color="primary"
                onClick={handleSaveChanges}
                disabled={loadingUpdate || selectedPerson.isMarkedFound}
              >
                {loadingUpdate ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Save Changes"
                )}
              </Button>
              {!selectedPerson.isMarkedFound && (
                <Button
                  disableRipple
                  // variant="contained"
                  color="success"
                  onClick={handleMarkFound}
                  disabled={loadingUpdate}
                >
                  {loadingUpdate ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Mark as Found"
                  )}
                </Button>
              )}
              {selectedPerson.isMarkedFound && (
                <Typography
                  variant="body2"
                  color="success.main"
                  sx={{ fontWeight: "bold" }}
                >
                  This person has been marked as found.
                </Typography>
              )}
            </Box>
          </Card>
        )}
        {!loadingDetails &&
          !selectedPerson &&
          !error &&
          reportList.length > 0 &&
          !loadingList && (
            <Typography
              variant="h6"
              align="center"
              sx={{ mt: 4, color: "text.secondary" }}
            >
              Select a person from the list to see details.
            </Typography>
          )}
        {!loadingDetails &&
          !selectedPerson &&
          !error &&
          reportList.length === 0 &&
          !loadingList && (
            <Typography
              variant="h6"
              align="center"
              sx={{ mt: 4, color: "text.secondary" }}
            >
              No reports found for your account. You can report a missing person
              if needed.
            </Typography>
          )}
      </Container>
      <Footer />
    </Box>
  );
};

export default StatusTracking;
