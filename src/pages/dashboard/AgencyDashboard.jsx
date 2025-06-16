import React, { useState, useEffect, useRef } from "react";
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
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import worldMapBackground from "/assets/background_image/world-map-background.jpg";
import Footer from "../../components/Footer";

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

const ROWS_PER_PAGE = 3;

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
  const successTimerRef = useRef(null);
  const errorTimerRef = useRef(null);

  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);

  const [requestsPage, setRequestsPage] = useState(1);
  const [volunteersPage, setVolunteersPage] = useState(1);

  useEffect(() => {
    // ... (agencyId setup logic remains the same)
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
      showErrorWithTimeout(
        "Agency ID is missing and could not be derived. Please ensure you are logged in correctly for the dashboard to function."
      );
    }
  }, []);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }
    };
  }, []);

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
    if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
        successTimerRef.current = null;
    }
    if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
        errorTimerRef.current = null;
    }
  };

  const showSuccessWithTimeout = (message) => {
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
        errorTimerRef.current = null;
    }
    setError("");
    setSuccessMessage(message);
    successTimerRef.current = setTimeout(() => {
      setSuccessMessage("");
      successTimerRef.current = null;
    }, 3000);
  };

  const showErrorWithTimeout = (message) => {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
        successTimerRef.current = null;
    }
    setSuccessMessage("");
    setError(message);
    errorTimerRef.current = setTimeout(() => {
      setError("");
      errorTimerRef.current = null;
    }, 3000);
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
      showErrorWithTimeout(`Failed to fetch agency volunteers: ${apiError.message}`);
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
      showErrorWithTimeout(`Failed to fetch volunteer requests: ${apiError.message}`);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (agencyId) {
      // Clear the specific "Agency ID is missing" error if it was set and ID is now available.
      if (error.includes("Agency ID is missing")) setError(""); 
      fetchRequests();
      fetchAgencyVolunteers();
    }
  }, [agencyId]);

  const handleSearch = async () => {
    setLoading(true);
    clearMessages();
    setSearchResult(null);

    if (!searchEmail.trim()) {
      showErrorWithTimeout("Please enter an email to search.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/users/search/?email=${encodeURIComponent(searchEmail)}`
      );

      if (response.ok) {
        const userData = await response.json();
        if (userData && userData.email === searchEmail) {
          setSearchResult({
            id: userData.id,
            full_name: userData["full_name"] || "N/A",
            email: userData.email,
          });
        } else {
          showErrorWithTimeout(`No volunteer found with the email: ${searchEmail}.`);
        }
      } else if (response.status === 404) {
        const errorData = await response.json().catch(() => null);
        showErrorWithTimeout(
          errorData?.error ||
            `No volunteer found with the email: ${searchEmail}.`
        );
      } else if (response.status === 400) {
        const errorData = await response.json().catch(() => null);
        showErrorWithTimeout(
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
      showErrorWithTimeout(`Failed to search: ${apiError.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = (user) => {
    setCurrentVolunteer(user);
    clearMessages();
    const userIdToCheck = user.id || user.volunteer_user_id;
    const existingVolunteerData = volunteers.find(
      (vol) => vol.member && vol.member.id === userIdToCheck
    );

    if (existingVolunteerData) {
      const currentPermissions = permissionsList.filter(
        (perm) => existingVolunteerData[perm] === true
      );
      setSelectedPermissions(currentPermissions);
    } else {
      setSelectedPermissions([]);
    }
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
      showErrorWithTimeout("Cannot delete: Invalid request data provided.");
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
        { method: "DELETE" }
      );
      if (response.status === 204) {
        showSuccessWithTimeout(
          `Volunteer request from ${volunteerName} deleted successfully.`
        );
        setRequests((prevRequests) =>
          prevRequests.filter((req) => req.id !== interestIdToDelete)
        );
        if (currentVolunteer && currentVolunteer.id === interestIdToDelete && currentVolunteer.volunteer_user_id === requestToDelete.volunteer_user_id) {
            setOpenModal(false);
            setCurrentVolunteer(null);
        }
      } else if (response.status === 404) {
        throw new Error("Request not found. It might have already been deleted.");
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to delete request. Status: ${response.status}. ${errorText}`);
      }
    } catch (apiError) {
      console.error("API Error deleting volunteer interest:", apiError);
      showErrorWithTimeout(`Error deleting request: ${apiError.message}`);
    } finally {
      setLoadingAction(false);
      setConfirmDeleteDialogOpen(false);
      setRequestToDelete(null);
    }
  };

  const handleGivePermissions = async () => {
    if (!currentVolunteer || !agencyId) {
      showErrorWithTimeout("Missing current volunteer data or Agency ID.");
      return;
    }
    clearMessages();
    setLoadingAction(true);
    const isFromRequest = currentVolunteer.hasOwnProperty("volunteer_user_id");
    const memberId = isFromRequest ? currentVolunteer.volunteer_user_id : currentVolunteer.id;
    const memberFullName = currentVolunteer.volunteer_name || currentVolunteer.full_name;
    let interestAccepted = false;
    let accumulatedError = "";

    if (isFromRequest && currentVolunteer.id) {
      try {
        const acceptResponse = await fetch(
          `${API_BASE_URL}/volunteer-interests/${currentVolunteer.id}/accept/`,
          { method: "POST" }
        );
        if (!acceptResponse.ok) {
          const errorData = await acceptResponse.json().catch(() => ({ detail: "Failed to accept interest." }));
          throw new Error(`Accept Interest API: ${errorData.detail || `Status ${acceptResponse.status}`}`);
        }
        interestAccepted = true;
      } catch (apiError) {
        console.error("API Error accepting interest:", apiError);
        accumulatedError += `Error accepting interest: ${apiError.message}. `;
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
        const errorData = await setPermissionsResponse.json().catch(() => ({ detail: "Failed to set permissions." }));
        throw new Error(`Set Permissions API: ${errorData.detail || `Status ${setPermissionsResponse.status}`}`);
      }
      
      if (accumulatedError) {
        showErrorWithTimeout(accumulatedError + `Permissions for ${memberFullName} set, but there was an issue with the initial request acceptance.`);
      } else {
        showSuccessWithTimeout(
          `Volunteer ${memberFullName} processed and permissions set successfully!`
        );
      }
      if (isFromRequest && interestAccepted) fetchRequests();
      fetchAgencyVolunteers();

    } catch (apiError) {
      console.error("API Error setting/creating permissions:", apiError);
      accumulatedError += `Error setting permissions for ${memberFullName}: ${apiError.message}`;
      showErrorWithTimeout(accumulatedError.trim());
      fetchAgencyVolunteers();
    } finally {
      setLoadingAction(false);
      setOpenModal(false);
      setCurrentVolunteer(null);
      setSearchResult(null);
      setSearchEmail("");
    }
  };

  const handleSavePermissions = async (memberIdToUpdate, currentVolunteerObject) => {
    if (!agencyId || !memberIdToUpdate) {
      showErrorWithTimeout("Agency ID or Member ID is missing for saving permissions.");
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
        const errorData = await response.json().catch(() => ({ detail: "Failed to update permissions." }));
        throw new Error(`Update Permissions API: ${errorData.detail || `HTTP error! status: ${response.status}`}`);
      }
      const updatedPermissionRecord = await response.json();
      setVolunteers((prevVolunteers) =>
        prevVolunteers.map((vol) =>
          vol.member.id === memberIdToUpdate ? updatedPermissionRecord : vol
        )
      );
      showSuccessWithTimeout(
        `Permissions for ${updatedPermissionRecord.member.full_name} updated successfully.`
      );
    } catch (apiError) {
      console.error("API Error updating permissions:", apiError);
      showErrorWithTimeout(
        `Error updating permissions for user ID ${memberIdToUpdate}: ${apiError.message}`
      );
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRequestsPageChange = (event, value) => setRequestsPage(value);
  const handleVolunteersPageChange = (event, value) => setVolunteersPage(value);

  const currentRequests = requests.slice((requestsPage - 1) * ROWS_PER_PAGE, requestsPage * ROWS_PER_PAGE);
  const currentVolunteers = volunteers.slice((volunteersPage - 1) * ROWS_PER_PAGE, volunteersPage * ROWS_PER_PAGE);

  return (
    <Box
      sx={{
        position: "absolute", minHeight: "100vh",
        background: `linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92)), url(${worldMapBackground})`,
        backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed",
        backgroundRepeat: "repeat-y", overflowX: "hidden", overflowY: "hidden",
        p: { xs: 1, sm: 2, md: 3 }, top: 0, left: 0, right: 0, zIndex: 0,
      }}
    >
      <Box
        sx={{
          minHeight: "60px", width: "100%", position: "sticky",
          top: "70px", zIndex: 1200, mb: error || successMessage ? 2 : 0,
        }}
      >
        {error && (
          <Alert
            severity="error"
            onClose={() => {
              setError("");
              if (errorTimerRef.current) {
                clearTimeout(errorTimerRef.current);
                errorTimerRef.current = null;
              }
            }}
            sx={{ width: "100%", whiteSpace: "pre-wrap" }}
          >
            {error}
          </Alert>
        )}
        {successMessage && !error && (
          <Alert
            severity="success"
            onClose={() => {
                setSuccessMessage("");
                if (successTimerRef.current) {
                    clearTimeout(successTimerRef.current);
                    successTimerRef.current = null;
                }
            }}
            sx={{ width: "100%" }}
          >
            {successMessage}
          </Alert>
        )}
      </Box>

      <Box sx={{ display: { xs: "block", md: "flex" }, minHeight: "calc(100vh - 150px)" }}>
        <Box
          sx={{
            width: { xs: "100%", md: 300 }, bgcolor: "#f9f9f9",
            mb: { xs: 2, md: 0 }, mr: { md: 2 }, p: 2, borderRadius: 2,
          }}
        >
          Sidebar Space
        </Box>

        <Box sx={{ flexGrow: 1, mt: { xs: 2, md: 0 } }}>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2, mb: 3 }}>
            <Box sx={{ width: { xs: "100%", md: "40%" }, mb: { xs: 3, md: 0 } }}>
              <Typography variant="h6">Search Volunteer</Typography>
              <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, mt: 1, alignItems: { xs: "stretch", sm: "center" } }}>
                <TextField
                  placeholder="Search by Email" value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  sx={{
                    borderBottom: "2px solid #eee",
                    "& .MuiOutlinedInput-root": { backgroundColor: "white", "& fieldset": { borderColor: "transparent" }, "&:hover fieldset": { borderColor: "transparent" }, "&.Mui-focused fieldset": { borderColor: "transparent" }, },
                    width: { xs: "100%", sm: "250px" }, flexGrow: { sm: 0 },
                  }}
                />
                <Button disableRipple onClick={handleSearch} disabled={loading} sx={{ flexShrink: 0 }}>Search</Button>
              </Box>
              {loading ? (<CircularProgress sx={{ mt: 2 }} />) : (
                searchResult && (
                  <Box sx={{ mt: 2 }}>
                    <Typography>Name: {searchResult.full_name}</Typography>
                    <Typography>Email: {searchResult.email}</Typography>
                    <Button disableRipple sx={{ mt: 1 }} onClick={() => handleAcceptRequest(searchResult)}> Add Volunteer </Button>
                  </Box>
                )
              )}
            </Box>

            <Box sx={{ width: { xs: "100%", md: "80%" } }}>
              <Typography variant="h6">Volunteer Requests</Typography>
              {loadingRequests ? (<CircularProgress sx={{ mt: 1 }} /> ) : requests.length === 0 ? (
                <Typography sx={{ mt: 1, fontStyle: "italic" }}>No pending requests.</Typography>
              ) : (
                <TableContainer component={Paper} sx={{ maxHeight: 350, overflow: "auto", width: "100%" }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: '20%', padding: '6px 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Name</TableCell>
                        <TableCell sx={{ width: '30%', padding: '6px 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Email</TableCell>
                        <TableCell sx={{ width: '20%', display: { xs: 'none', sm: 'table-cell' }, padding: '6px 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Contact</TableCell>
                        <TableCell sx={{ width: '20%', display: { xs: 'none', md: 'table-cell' }, padding: '6px 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Note</TableCell>
                        <TableCell sx={{ width: 'auto', padding: '6px 10px' }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {requests.map((req) => (
                        <TableRow key={req.id} sx={{ height: '48px' }}>
                          <TableCell sx={{ padding: '6px 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.volunteer_name}</TableCell>
                          <TableCell sx={{ padding: '6px 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.volunteer_email}</TableCell>
                          <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, padding: '6px 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.volunteer_contact}</TableCell>
                          <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, padding: '6px 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.message}</TableCell>
                          <TableCell sx={{ padding: '6px 10px' }}><Button disableRipple size="small" onClick={() => handleAcceptRequest(req)}>Accept</Button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Box>

          <Box sx={{ width: "100%" }}>
            <Typography variant="h6">Manage Existing Permissions</Typography>
            {loadingVolunteers ? (<CircularProgress sx={{ mt: 1 }} />) : volunteers.length === 0 ? (
              <Typography sx={{ mt: 1, fontStyle: "italic" }}>No agency volunteers found.</Typography>
            ) : (
              <TableContainer component={Paper} sx={{ overflowX: "auto", mt: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ height: '52px' }}>
                      <TableCell sx={{ padding: '6px 10px', minWidth: '100px' }}>Name</TableCell>
                      {permissionsList.map((perm) => (<TableCell key={perm} sx={{ padding: '6px 7px', textAlign: 'center', minWidth: '95px'}}>{perm.replace(/_/g, " ")}</TableCell>))}
                      <TableCell sx={{ padding: '6px 10px', textAlign: 'center' }}>Save</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {volunteers.map((vol) => (
                      <TableRow key={vol.member.id} sx={{ height: '48px' }}>
                        <TableCell sx={{ padding: '6px 10px' }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {vol.member.full_name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                                {vol.member.email}
                            </Typography>
                        </TableCell>
                        {permissionsList.map((perm) => (
                          <TableCell key={perm} sx={{ padding: '0px 8px', textAlign: 'center' }}>
                            <Checkbox checked={!!vol[perm]} onChange={(e) => {
                                setVolunteers((prevVols) => prevVols.map((v_orig) => v_orig.member.id === vol.member.id ? { ...v_orig, [perm]: e.target.checked } : v_orig));
                              }} sx={{ padding: '4px' }}/>
                          </TableCell>
                        ))}
                        <TableCell sx={{ padding: '6px 10px', textAlign: 'center' }}>
                          <Button disableRipple size="small" onClick={() => {
                              const volunteerToSave = volunteers.find((v_orig) => v_orig.member.id === vol.member.id);
                              if (volunteerToSave) handleSavePermissions(vol.member.id, volunteerToSave);
                            }} disabled={loadingAction}>Save</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>

          <Modal open={openModal} onClose={() => { setOpenModal(false); setCurrentVolunteer(null); }}>
            <Box sx={style}>
              <Typography variant="h6" gutterBottom>Grant Permissions</Typography>
              <Typography variant="body2" sx={{ mb: 0 }}>Volunteer: {currentVolunteer?.volunteer_name || currentVolunteer?.full_name}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>Email: {currentVolunteer?.volunteer_email || currentVolunteer?.email}</Typography>
              <FormGroup sx={{ maxHeight: "calc(90vh - 250px)", overflowY: "auto", pr: 1 }}>
                {permissionsList.map((perm) => (
                  <FormControlLabel control={<Checkbox checked={selectedPermissions.includes(perm)} onChange={() => handlePermissionChange(perm)}/>} label={perm.replace(/_/g, " ")} key={perm}/>
                ))}
              </FormGroup>
              <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", gap: 1 }}>
                {currentVolunteer && currentVolunteer.volunteer_user_id && (
                  <Button variant="outlined" color="error" onClick={() => initiateDeleteRequest(currentVolunteer)} disabled={loadingAction} size="small">Delete Request</Button>
                )}
                {!(currentVolunteer && currentVolunteer.volunteer_user_id) && <Box sx={{ flexGrow: 1 }}></Box>}
                <Box sx={{ display: 'flex', gap: 1}}>
                    <Button variant="outlined" onClick={() => { setOpenModal(false); setCurrentVolunteer(null);}} disabled={loadingAction} size="small">Cancel</Button>
                    <Button variant="contained" color="primary" onClick={handleGivePermissions} disabled={loadingAction} size="small">
                      {loadingAction ? (<CircularProgress size={20} color="inherit" />) : ("Give Permissions")}
                    </Button>
                </Box>
              </Box>
            </Box>
          </Modal>

          <Dialog open={confirmDeleteDialogOpen} onClose={() => { setConfirmDeleteDialogOpen(false); setRequestToDelete(null); }} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
            <DialogTitle id="alert-dialog-title">Confirm Deletion</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Are you sure you want to delete the request from {requestToDelete?.volunteer_name || "this volunteer"}? This cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => { setConfirmDeleteDialogOpen(false); setRequestToDelete(null);}} disabled={loadingAction}>Cancel</Button>
              <Button onClick={executeDeleteRequest} color="error" disabled={loadingAction} autoFocus>
                {loadingAction ? (<CircularProgress size={20} color="inherit" />) : ("Confirm Delete")}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}