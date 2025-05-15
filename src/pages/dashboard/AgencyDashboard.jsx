import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Modal,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import worldMapBackground from "/assets/background_image/world-map-background.jpg"; // Make sure this path is correct

const permissionsList = [
  "can_view_missing",
  "can_edit_missing",
  "can_view_announcements",
  "can_edit_announcements",
  "can_make_announcements",
  "can_manage_volunteers",
  "is_agency_admin",
];

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const ROWS_PER_PAGE = 3; // Max rows to display per page

const API_BASE_URL =
  "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api";

export default function AgencyDashboard() {
  const [agencyId, setAgencyId] = useState(null);

  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  const [requests, setRequests] = useState([]);
  const [volunteers, setVolunteers] = useState([]);

  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [currentVolunteer, setCurrentVolunteer] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingVolunteers, setLoadingVolunteers] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);

  const [requestsPage, setRequestsPage] = useState(1);
  const [volunteersPage, setVolunteersPage] = useState(1);

  useEffect(() => {
    let idToUse = localStorage.getItem("agency_id");
    if (!idToUse) {
      const userString = localStorage.getItem("user");
      if (userString) {
        try {
          const userObject = JSON.parse(userString);
          if (
            userObject &&
            userObject.role === "agency" &&
            userObject.user_id
          ) {
            idToUse = userObject.user_id.toString();
          }
        } catch (e) {
          console.error(
            "[AgencyDashboard] Failed to parse 'user' for fallback agency_id",
            e
          );
        }
      }
    }
    if (idToUse) {
      setAgencyId(idToUse);
    } else {
      setError(
        "Agency ID is missing and could not be derived. Please ensure you are logged in correctly for the dashboard to function."
      );
    }
  }, []);

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  const fetchAgencyVolunteers = async () => {
    if (!agencyId) return;
    setLoadingVolunteers(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/agency/${agencyId}/permissions/`
      );
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ detail: "Failed to fetch agency volunteers" }));
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }
      const data = await response.json();
      setVolunteers(data);
      setVolunteersPage(1);
    } catch (apiError) {
      console.error("Failed to fetch agency volunteers:", apiError);
      setError(`Failed to fetch agency volunteers: ${apiError.message}`);
    } finally {
      setLoadingVolunteers(false);
    }
  };

  const fetchRequests = async () => {
    if (!agencyId) return;
    setLoadingRequests(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/volunteer-interests/?agency_id=${agencyId}`
      );
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ detail: "Failed to fetch volunteer requests" }));
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }
      let data = await response.json();
      data.sort((a, b) => b.id - a.id);
      const formattedRequests = data
        .map((req) => ({
          id: req.id,
          volunteer_user_id: req.volunteer,
          volunteer_name: req.volunteer_name || `User ID: ${req.volunteer}`,
          volunteer_email: req.volunteer_email || "N/A",
          volunteer_contact: req.volunteer_contact || "N/A",
          message: req.message || "No message provided.",
          is_accepted: req.is_accepted,
        }))
        .filter((req) => !req.is_accepted);
      setRequests(formattedRequests);
      setRequestsPage(1);
    } catch (apiError) {
      console.error("Failed to fetch volunteer requests:", apiError);
      setError(`Failed to fetch volunteer requests: ${apiError.message}`);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (agencyId) {
      if (error.includes("Agency ID is missing")) setError("");
      fetchRequests();
      fetchAgencyVolunteers();
    }
  }, [agencyId, error]);

  const handleSearch = async () => {
    setLoading(true);
    clearMessages();
    setSearchResult(null);

    if (!searchEmail.trim()) {
      setError("Please enter an email to search.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/users/search/?email=${encodeURIComponent(searchEmail)}`
      ); // [cite: 5]

      if (response.ok) {
        // [cite: 6]
        const userData = await response.json();
        if (userData && userData.email === searchEmail) {
          setSearchResult({
            id: userData.id,
            full_name: userData["full name"] || "N/A", // [cite: 7]
            email: userData.email, // [cite: 7]
            // role: userData.role, // Role is available from API [cite: 7]
          });
        } else {
          setError(`No volunteer found with the email: ${searchEmail}.`);
        }
      } else if (response.status === 404) {
        // [cite: 9]
        const errorData = await response.json().catch(() => null);
        setError(
          errorData?.error ||
            `No volunteer found with the email: ${searchEmail}.`
        ); // [cite: 10]
      } else if (response.status === 400) {
        // [cite: 8]
        const errorData = await response.json().catch(() => null);
        setError(
          errorData?.error ||
            "Search input is invalid. Please check the email entered."
        );
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ detail: "Failed to search for volunteer." }));
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }
    } catch (apiError) {
      console.error("Failed to search volunteer:", apiError);
      setError(`Failed to search: ${apiError.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = (user) => {
    setCurrentVolunteer(user);
    setSelectedPermissions([]);
    clearMessages();
    setOpenModal(true);
  };

  const handlePermissionChange = (permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const initiateDeleteRequest = (requestData) => {
    if (!requestData || !requestData.id || !requestData.volunteer_user_id) {
      setError("Cannot delete: Invalid request data provided.");
      return;
    }
    setRequestToDelete(requestData);
    setConfirmDeleteDialogOpen(true);
  };

  const executeDeleteRequest = async () => {
    if (!requestToDelete) return;

    const interestIdToDelete = requestToDelete.id;
    const volunteerName = requestToDelete.volunteer_name || "Volunteer";

    clearMessages();
    setLoadingAction(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/volunteer-interests/${interestIdToDelete}/`,
        {
          method: "DELETE",
        }
      );

      if (response.status === 204) {
        setSuccessMessage(
          `Volunteer request from ${volunteerName} deleted successfully.`
        );
        setRequests((prevRequests) =>
          prevRequests.filter((req) => req.id !== interestIdToDelete)
        );
        setOpenModal(false);
        setCurrentVolunteer(null);
      } else if (response.status === 404) {
        throw new Error(
          "Request not found. It might have already been deleted."
        );
      } else {
        const errorText = await response.text();
        throw new Error(
          `Failed to delete request. Status: ${response.status}. ${errorText}`
        );
      }
    } catch (apiError) {
      console.error("API Error deleting volunteer interest:", apiError);
      setError(`Error deleting request: ${apiError.message}`);
    } finally {
      setLoadingAction(false);
      setConfirmDeleteDialogOpen(false);
      setRequestToDelete(null);
    }
  };

  const handleGivePermissions = async () => {
    if (!currentVolunteer || !agencyId) {
      setError("Missing current volunteer data or Agency ID.");
      return;
    }
    clearMessages();
    setLoadingAction(true);

    const isFromRequest = currentVolunteer.hasOwnProperty("volunteer_user_id");
    const memberId = isFromRequest
      ? currentVolunteer.volunteer_user_id
      : currentVolunteer.id;
    const memberFullName =
      currentVolunteer.volunteer_name || currentVolunteer.full_name;
    let interestAccepted = false;

    if (isFromRequest && currentVolunteer.id) {
      try {
        const acceptResponse = await fetch(
          `${API_BASE_URL}/volunteer-interests/${currentVolunteer.id}/accept/`,
          {
            method: "POST",
          }
        );
        if (!acceptResponse.ok) {
          const errorData = await acceptResponse
            .json()
            .catch(() => ({ detail: "Failed to accept interest." }));
          throw new Error(
            `Accept Interest API: ${
              errorData.detail || `Status ${acceptResponse.status}`
            }`
          );
        }
        interestAccepted = true;
      } catch (apiError) {
        console.error("API Error accepting interest:", apiError);
        setError(
          `Error accepting interest: ${apiError.message}. Attempting to set permissions...`
        );
      }
    }

    const permissionPayload = {};
    permissionsList.forEach((perm) => {
      permissionPayload[perm] = selectedPermissions.includes(perm);
    });

    try {
      const setPermissionsResponse = await fetch(
        `${API_BASE_URL}/agency/${agencyId}/permissions/${memberId}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(permissionPayload),
        }
      );
      if (!setPermissionsResponse.ok) {
        const errorData = await setPermissionsResponse
          .json()
          .catch(() => ({ detail: "Failed to set permissions." }));
        throw new Error(
          `Set Permissions API: ${
            errorData.detail || `Status ${setPermissionsResponse.status}`
          }`
        );
      }
      setSuccessMessage(
        `Volunteer ${memberFullName} processed and permissions set successfully!`
      );
      if (isFromRequest && interestAccepted) {
        fetchRequests();
      }
      fetchAgencyVolunteers();
    } catch (apiError) {
      console.error("API Error setting/creating permissions:", apiError);
      setError((prev) =>
        `${prev}\nError setting permissions for ${memberFullName}: ${apiError.message}`.trim()
      );
      fetchAgencyVolunteers();
    } finally {
      setLoadingAction(false);
      setOpenModal(false);
      setCurrentVolunteer(null);
      setSearchResult(null);
    }
  };

  const handleSavePermissions = async (
    memberIdToUpdate,
    currentVolunteerObject
  ) => {
    if (!agencyId || !memberIdToUpdate) {
      setError("Agency ID or Member ID is missing for saving permissions.");
      return;
    }
    clearMessages();
    setLoadingAction(true);

    const permissionPayload = {};
    permissionsList.forEach((perm) => {
      permissionPayload[perm] = !!currentVolunteerObject[perm];
    });

    try {
      const response = await fetch(
        `${API_BASE_URL}/agency/${agencyId}/permissions/${memberIdToUpdate}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(permissionPayload),
        }
      );
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ detail: "Failed to update permissions." }));
        throw new Error(
          `Update Permissions API: ${
            errorData.detail || `HTTP error! status: ${response.status}`
          }`
        );
      }
      const updatedPermissionRecord = await response.json();
      setVolunteers((prevVolunteers) =>
        prevVolunteers.map((vol) =>
          vol.member.id === memberIdToUpdate ? updatedPermissionRecord : vol
        )
      );
      setSuccessMessage(
        `Permissions for ${updatedPermissionRecord.member.full_name} updated successfully.`
      );
    } catch (apiError) {
      console.error("API Error updating permissions:", apiError);
      setError(
        `Error updating permissions for user ID ${memberIdToUpdate}: ${apiError.message}`
      );
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRequestsPageChange = (event, value) => {
    setRequestsPage(value);
  };

  const handleVolunteersPageChange = (event, value) => {
    setVolunteersPage(value);
  };

  // Calculate items for current page - Requests
  const currentRequests = requests.slice(
    (requestsPage - 1) * ROWS_PER_PAGE,
    requestsPage * ROWS_PER_PAGE
  );
  const requestsPageCount = Math.ceil(requests.length / ROWS_PER_PAGE);

  // Calculate items for current page - Volunteers
  const currentVolunteers = volunteers.slice(
    (volunteersPage - 1) * ROWS_PER_PAGE,
    volunteersPage * ROWS_PER_PAGE
  );
  const volunteersPageCount = Math.ceil(volunteers.length / ROWS_PER_PAGE);

  return (
    <Box
      sx={{
        position: "absolute",
        minHeight: "100vh",
        background: `linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92)), url(${worldMapBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "repeat-y",
        overflowX: "hidden",
        overflowY: "hidden",
        display: "flex",
        flexDirection: "column",
        p: { xs: 1, sm: 2, md: 3 },
        top: 0,
        left: 0,
        right: 0,
        padding: 0,
        zIndex: 0,
      }}
    >
      <Box
        sx={{
          minHeight: "60px",
          width: "100%",
          position: "sticky",
          top: "70px",
          zIndex: 1200,
          mb: error || successMessage ? 2 : 0,
        }}
      >
        {error && (
          <Alert
            severity="error"
            onClose={() => setError("")}
            sx={{ width: "100%", whiteSpace: "pre-wrap" }}
          >
            {error}
          </Alert>
        )}
        {successMessage && !error && (
          <Alert
            severity="success"
            onClose={() => setSuccessMessage("")}
            sx={{ width: "100%" }}
          >
            {successMessage}
          </Alert>
        )}
      </Box>

      <Box
        sx={{
          display: { xs: "block", md: "flex" },
          minHeight: "calc(100vh - 150px)",
        }}
      >
        <Box
          sx={{
            width: { xs: "100%", md: 300 }, // Sidebar width
            bgcolor: "#f9f9f9",
            mb: { xs: 2, md: 0 },
            mr: { md: 2 },
            p: 2,
            borderRadius: 2,
          }}
        >
          Sidebar Space
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          {/* Parent Box for Search and Requests - horizontal layout */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              mb: 3,
            }}
          >
            {/* Search Section */}
            <Box
              sx={{
                width: { xs: "100%", md: "40%" },
                mb: { xs: 3, md: 0 },
              }}
            >
              <Typography variant="h6">Search Volunteer</Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                  mt: 1,
                  alignItems: { xs: "stretch", sm: "center" },
                }}
              >
                <TextField
                  placeholder="Search by Email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  sx={{
                    borderBottom: "2px solid #eee",
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "white",
                      "& fieldset": { borderColor: "transparent" },
                      "&:hover fieldset": { borderColor: "transparent" },
                      "&.Mui-focused fieldset": { borderColor: "transparent" },
                    },
                    width: { xs: "100%", sm: "250px" }, // Adjusted for flex layout
                    flexGrow: { sm: 0 }, // Allow textfield to grow
                  }}
                />
                <Button
                  disableRipple
                  onClick={handleSearch}
                  disabled={loading}
                  sx={{ flexShrink: 0 }}
                >
                  Search
                </Button>
              </Box>
              {loading ? (
                <CircularProgress sx={{ mt: 2 }} />
              ) : (
                searchResult && (
                  <Box sx={{ mt: 2 }}>
                    <Typography>Name: {searchResult.full_name}</Typography>
                    <Typography>Email: {searchResult.email}</Typography>
                    <Button
                      disableRipple
                      sx={{ mt: 1 }}
                      onClick={() => handleAcceptRequest(searchResult)}
                    >
                      Add Volunteer
                    </Button>
                  </Box>
                )
              )}
            </Box>

            {/* Requests Section */}
            <Box
              sx={{
                width: { xs: "100%", md: "80%" },
              }}
            >
              <Typography variant="h6">Volunteer Requests</Typography>
              {loadingRequests ? (
                <CircularProgress sx={{ mt: 1 }} />
              ) : requests.length === 0 ? (
                <Typography sx={{ mt: 1, fontStyle: "italic" }}>
                  No pending requests.
                </Typography>
              ) : (
                <TableContainer
                  component={Paper}
                  sx={{
                    maxHeight: 350, // Adjusted height for side-by-side layout
                    overflow: "auto", // Changed to auto for both axes if needed
                    width: "100%",
                  }}
                >
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            width: "20%",
                            padding: "6px 10px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Name
                        </TableCell>
                        <TableCell
                          sx={{
                            width: "30%",
                            padding: "6px 10px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Email
                        </TableCell>
                        <TableCell
                          sx={{
                            width: "20%",
                            display: { xs: "none", sm: "table-cell" },
                            padding: "6px 10px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Contact
                        </TableCell>
                        {/* Note column might be too much for this layout, consider removing or further reducing width/hiding on smaller of 'md' screens */}
                        <TableCell
                          sx={{
                            width: "20%",
                            display: { xs: "none", md: "table-cell" }, // Display on md if space allows
                            padding: "6px 10px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Note
                        </TableCell>
                        <TableCell sx={{ width: "auto", padding: "6px 10px" }}>
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {requests.map((req) => (
                        <TableRow key={req.id} sx={{ height: "48px" }}>
                          <TableCell
                            sx={{
                              padding: "6px 10px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {req.volunteer_name}
                          </TableCell>
                          <TableCell
                            sx={{
                              padding: "6px 10px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {req.volunteer_email}
                          </TableCell>
                          <TableCell
                            sx={{
                              display: { xs: "none", sm: "table-cell" },
                              padding: "6px 10px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {req.volunteer_contact}
                          </TableCell>
                          <TableCell
                            sx={{
                              display: { xs: "none", md: "table-cell" },
                              padding: "6px 10px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {req.message}
                          </TableCell>
                          <TableCell sx={{ padding: "6px 10px" }}>
                            <Button
                              disableRipple
                              size="small"
                              onClick={() => handleAcceptRequest(req)}
                            >
                              Accept
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              {requests.length > 1 && (
                  <Pagination
                    count={requestsPageCount}
                    page={requestsPage}
                    onChange={handleRequestsPageChange}
                    sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
                    color="primary"
                  />
                )}
            </Box>
          </Box>

          {/* Manage Existing Volunteers Section */}
          <Box sx={{ width: "100%" }}>
            {" "}
            {/* This Box already takes 100% width */}
            <Typography variant="h6">Manage Existing Permissions</Typography>
            {loadingVolunteers ? (
              <CircularProgress sx={{ mt: 1 }} />
            ) : volunteers.length === 0 ? (
              <Typography sx={{ mt: 1, fontStyle: "italic" }}>
                No agency volunteers found.
              </Typography>
            ) : (
              <TableContainer
                component={Paper}
                sx={{ overflowX: "auto", mt: 1 /* Added margin top */ }}
              >
                {/* Applied size="small" and specific padding/height for cells/rows */}
                <Table size="small">
                  <TableHead>
                    <TableRow
                      sx={{ height: "52px" /* Adjusted header row height */ }}
                    >
                      <TableCell
                        sx={{
                          padding: "6px 10px",
                          minWidth:
                            "100px" /* Ensure name column has enough space */,
                        }}
                      >
                        Name
                      </TableCell>
                      {permissionsList.map((perm) => (
                        <TableCell
                          key={perm}
                          sx={{
                            padding: "6px 7px", // Reduced padding for permission columns
                            textAlign: "center", // Center permission headers
                            minWidth: "95px", // Give permission columns a min width
                          }}
                        >
                          {perm.replace(/_/g, " ")}
                        </TableCell>
                      ))}
                      <TableCell
                        sx={{ padding: "6px 10px", textAlign: "center" }}
                      >
                        Save
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {volunteers.map((vol) => (
                      <TableRow
                        key={vol.member.id}
                        sx={{ height: "48px" /* Consistent row height */ }}
                      >
                        <TableCell sx={{ padding: "6px 10px" }}>
                          {vol.member.full_name}
                        </TableCell>
                        {permissionsList.map((perm) => (
                          <TableCell
                            key={perm}
                            sx={{
                              padding: "0px 8px", // Minimal vertical padding, adjusted horizontal for checkbox
                              textAlign: "center",
                            }}
                          >
                            <Checkbox
                              checked={!!vol[perm]}
                              onChange={(e) => {
                                setVolunteers((prevVols) =>
                                  prevVols.map((v_orig) => // Iterate over original list
                                      v_orig.member.id === vol.member.id // Compare with item from current page
                                        ? { ...v_orig, [perm]: e.target.checked }
                                        : v_orig
                                  )
                                );
                              }}
                              sx={{ padding: "4px" }} // Control padding around the checkbox itself
                            />
                          </TableCell>
                        ))}
                        <TableCell
                          sx={{ padding: "6px 10px", textAlign: "center" }}
                        >
                          <Button
                            disableRipple
                            size="small" // Made button smaller
                            onClick={() => {
                              const volunteerToSave = volunteers.find(
                                  (v_orig) => v_orig.member.id === vol.member.id
                                );
                              if (volunteerToSave) {
                                handleSavePermissions(
                                  vol.member.id,
                                  volunteerToSave
                                );
                              }
                            }}
                            disabled={loadingAction}
                          >
                            Save
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {volunteersPageCount > 1 && (
                  <Pagination
                    count={volunteersPageCount}
                    page={volunteersPage}
                    onChange={handleVolunteersPageChange}
                    sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
                    color="primary"
                  />
                )}
          </Box>

          {/* Permission Processing Modal */}
          <Modal
            open={openModal}
            onClose={() => {
              setOpenModal(false);
              setCurrentVolunteer(null);
            }}
          >
            <Box sx={style}>
              <Typography variant="h6" gutterBottom>
                Grant Permissions
              </Typography>
              <Typography variant="body2" sx={{ mb: 0 }}>
                Volunteer:{" "}
                {currentVolunteer?.volunteer_name ||
                  currentVolunteer?.full_name}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Email:{" "}
                {currentVolunteer?.volunteer_email || currentVolunteer?.email}
              </Typography>
              <FormGroup
                sx={{
                  maxHeight: "calc(90vh - 250px)",
                  overflowY: "auto",
                  pr: 1,
                }}
              >
                {permissionsList.map((perm) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedPermissions.includes(perm)}
                        onChange={() => handlePermissionChange(perm)}
                      />
                    }
                    label={perm.replace(/_/g, " ")}
                    key={perm}
                  />
                ))}
              </FormGroup>
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                {currentVolunteer && currentVolunteer.volunteer_user_id && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => initiateDeleteRequest(currentVolunteer)}
                    disabled={loadingAction}
                    size="small"
                  >
                    Delete Request
                  </Button>
                )}
                {!currentVolunteer?.volunteer_user_id && (
                  <Box sx={{ flexGrow: 1 }}></Box>
                )}

                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setOpenModal(false);
                      setCurrentVolunteer(null);
                    }}
                    disabled={loadingAction}
                    size="small"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleGivePermissions}
                    disabled={loadingAction}
                    size="small"
                  >
                    {loadingAction ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      "Give Permissions"
                    )}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Modal>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={confirmDeleteDialogOpen}
            onClose={() => {
              setConfirmDeleteDialogOpen(false);
              setRequestToDelete(null);
            }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">Confirm Deletion</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Are you sure you want to delete the request from{" "}
                {requestToDelete?.volunteer_name || "this volunteer"}? This
                cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setConfirmDeleteDialogOpen(false);
                  setRequestToDelete(null);
                }}
                disabled={loadingAction}
              >
                Cancel
              </Button>
              <Button
                onClick={executeDeleteRequest}
                color="error"
                disabled={loadingAction}
                autoFocus
              >
                {loadingAction ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Confirm Delete"
                )}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Box>
  );
}
