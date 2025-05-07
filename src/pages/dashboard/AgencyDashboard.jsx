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
  DialogTitle, // Added Dialog components
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
  // Modal style from reference
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

  const [loading, setLoading] = useState(false); // General loading for search
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingVolunteers, setLoadingVolunteers] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false); // Loading state for modal actions

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // State for delete confirmation dialog
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);

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
            // localStorage.setItem('agency_id', idToUse);
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
      const data = await response.json();
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
  }, [agencyId]);

  const handleSearch = () => {
    setLoading(true);
    clearMessages();
    setTimeout(() => {
      setSearchResult({
        id: Date.now(),
        full_name: `Searched User ${searchEmail.split("@")[0] || "Test"}`,
        email: searchEmail || "test@example.com",
      });
      setLoading(false);
    }, 1000);
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

  // Function to initiate the delete process by opening the confirmation dialog
  const initiateDeleteRequest = (requestData) => {
    if (!requestData || !requestData.id || !requestData.volunteer_user_id) {
      setError("Cannot delete: Invalid request data provided.");
      return;
    }
    setRequestToDelete(requestData); // Store the request to be deleted
    setConfirmDeleteDialogOpen(true); // Open the confirmation dialog
  };

  // Function that performs the actual deletion after confirmation
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
        setOpenModal(false); // Close the main modal as well
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
      setConfirmDeleteDialogOpen(false); // Close the confirmation dialog
      setRequestToDelete(null); // Clear the request to delete
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

  return (
    <Box
      sx={{
        position: "absolute", minHeight: "100vh",
        background: `linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92)), url(${worldMapBackground})`,
        backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed", backgroundRepeat: "repeat-y",
        overflowX: "hidden",
        overflowY: "hidden",
        // marginTop:"65px", 
        display: 'flex', flexDirection: 'column',
        p: { xs: 1, sm: 2, md: 3 },
        top: 0,
        left: 0,
        right: 0,
        padding: 0,
        zIndex: 0,
      }}
    >
      {/* --- Start Fix for Alert Layout Shift --- */}
      {/* Outer Box acts as a placeholder to reserve space */}
      <Box sx={{ 
          minHeight: '60px', // Adjust height as needed based on your Alert size + margins
          width: '100%',     // Ensure it takes full width
          // Keep sticky positioning container if needed, but apply to this Box
          position: 'sticky', 
          top: '65px', // Adjust based on your header height
          zIndex: 1200,
          // Add bottom margin here instead of on the Alert itself
          mb: (error || successMessage) ? 2 : 0, // Add margin only when alert is visible
          // Hide placeholder box visually if no message (optional, if minHeight is enough)
          // visibility: (error || successMessage) ? 'visible' : 'hidden' // Alternative approach
         }}>
        
        {/* Render Error Alert if error exists */}
        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError('')} 
            // sx props for styling, no margin needed here if set on container
            sx={{ width: '100%', whiteSpace: 'pre-wrap' }} 
          >
            {error}
          </Alert>
        )}

        {/* Render Success Alert if successMessage exists AND there is no error */}
        {successMessage && !error && (
          <Alert 
            severity="success" 
            onClose={() => setSuccessMessage('')} 
            sx={{ width: '100%' }} // sx props for styling
          >
            {successMessage}
          </Alert>
        )}
      </Box>
      {/* --- End Fix for Alert Layout Shift --- */}

      <Box
        sx={{
          display: { xs: "block", md: "flex" },
          minHeight: "calc(100vh - 80px)",
        }}
      >
        <Box
          sx={{
            width: { xs: "100%", md: 300 },
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
          {/* Search Section */}
          <Box sx={{ mb: 3 }}>
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
                  width: { xs: "100%", md: "300px" },
                }}
              />
              <Button disableRipple onClick={handleSearch} disabled={loading}>
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
          <Box sx={{ mb: 3 }}>
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
                sx={{ maxHeight: 300, overflowX: "auto" }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell
                        sx={{ display: { xs: "none", sm: "table-cell" } }}
                      >
                        Contact
                      </TableCell>
                      <TableCell
                        sx={{ display: { xs: "none", md: "table-cell" } }}
                      >
                        Note
                      </TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell>{req.volunteer_name}</TableCell>
                        <TableCell>{req.volunteer_email}</TableCell>
                        <TableCell
                          sx={{ display: { xs: "none", sm: "table-cell" } }}
                        >
                          {req.volunteer_contact}
                        </TableCell>
                        <TableCell
                          sx={{ display: { xs: "none", md: "table-cell" } }}
                        >
                          {req.message}
                        </TableCell>
                        <TableCell>
                          <Button
                            disableRipple
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
            {requests.length > 0 && <Pagination count={1} sx={{ mt: 1 }} />}
          </Box>

          {/* Manage Existing Volunteers Section */}
          <Box>
            <Typography variant="h6">Manage Existing Permissions</Typography>
            {loadingVolunteers ? (
              <CircularProgress sx={{ mt: 1 }} />
            ) : volunteers.length === 0 ? (
              <Typography sx={{ mt: 1, fontStyle: "italic" }}>
                No agency volunteers found.
              </Typography>
            ) : (
              <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      {permissionsList.map((perm) => (
                        <TableCell key={perm}>
                          {perm.replace(/_/g, " ")}
                        </TableCell>
                      ))}
                      <TableCell>Save</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {volunteers.map((vol) => (
                      <TableRow key={vol.member.id}>
                        <TableCell>{vol.member.full_name}</TableCell>
                        {permissionsList.map((perm) => (
                          <TableCell key={perm}>
                            <Checkbox
                              checked={!!vol[perm]}
                              onChange={(e) => {
                                setVolunteers((prevVols) =>
                                  prevVols.map((v) =>
                                    v.member.id === vol.member.id
                                      ? { ...v, [perm]: e.target.checked }
                                      : v
                                  )
                                );
                              }}
                            />
                          </TableCell>
                        ))}
                        <TableCell>
                          <Button
                            disableRipple
                            onClick={() => {
                              const volunteerToSave = volunteers.find(
                                (v) => v.member.id === vol.member.id
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
            {volunteers.length > 0 && <Pagination count={1} sx={{ mt: 1 }} />}
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
              {/* Action buttons */}
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                {/* Delete Button - Conditionally rendered */}
                {currentVolunteer && currentVolunteer.volunteer_user_id && (
                  <Button
                    variant="outlined"
                    color="error"
                    // Changed onClick to initiate delete confirmation
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
