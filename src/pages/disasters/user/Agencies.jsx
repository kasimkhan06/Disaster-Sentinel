import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  TextField,
  Autocomplete,
  Tooltip,
  IconButton,
  Pagination,
  Stack,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Avatar,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import PublicIcon from "@mui/icons-material/Public";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import useAgencyData from "../../../hooks/useAgencyData";
import { getCurrentLocationState } from "../../../utils/locationUtils";
import worldMapBackground from "/assets/background_image/world-map-background.jpg";
import Footer from "../../../components/Footer";

const Agencies = () => {
  const { existingAgencies, addedAgencies, states, loading, error } =
    useAgencyData();
  const navigate = useNavigate();

  const [selectedState, setSelectedState] = useState("All States");
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openVolunteerDialog, setOpenVolunteerDialog] = useState(false);
  const [volunteerMessage, setVolunteerMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [agencyNameFilter, setAgencyNameFilter] = useState("");
  const [agencySuggestions, setAgencySuggestions] = useState([]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isBelow = useMediaQuery("(max-width:1470px)");

  const itemsPerPage = 20;
  const rowHeight = 30; // Reduced row height
  const headerHeight = 50; // Reduced header height
  const paginationHeight = 72;
  const avatarSize = 20; // New constant for avatar size

  // Sort agencies alphabetically by name
  const allAgencies = [...existingAgencies, ...addedAgencies].sort((a, b) => {
    const nameA = a?.name?.toLowerCase() || "";
    const nameB = b?.name?.toLowerCase() || "";
    return nameA.localeCompare(nameB);
  });

  const [filteredAgencies, setFilteredAgencies] = useState(allAgencies);

  useEffect(() => {
    setFilteredAgencies(allAgencies);
    setPage(1);
  }, [existingAgencies, addedAgencies]);

  useEffect(() => {
    let filtered = allAgencies;

    if (selectedState !== "All States") {
      filtered = filtered.filter((agency) => agency.state === selectedState);
    }

    if (agencyNameFilter) {
      filtered = filtered.filter((agency) => {
        const name = agency?.name?.toLowerCase() || "";
        const agencyName = agency?.agency_name?.toLowerCase() || "";
        const filter = agencyNameFilter.toLowerCase();
        return name.includes(filter) || agencyName.includes(filter);
      });
    }

    setFilteredAgencies(filtered);
    setPage(1);
  }, [selectedState, agencyNameFilter, existingAgencies, addedAgencies]);

  const paginatedAgencies = filteredAgencies.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const calculateTableHeight = () => {
    const rowCount = Math.min(paginatedAgencies.length, itemsPerPage);
    return headerHeight + rowCount * rowHeight;
  };

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setLocationError(null);

    try {
      const state = await getCurrentLocationState();
      setSelectedState(state);
    } catch (err) {
      setLocationError(err);
    } finally {
      setIsLocating(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedState("All States");
    setLocationError(null);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleRowClick = (agency) => {
    if (agency.isAddedAgency) {
      navigate(`/agency/${agency.user_id}`);
    } else {
      setSelectedAgency(agency);
      setOpenDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const updateAgencySuggestions = (inputValue, stateFilter) => {
    let filtered = allAgencies;

    if (stateFilter !== "All States") {
      filtered = filtered.filter((agency) => agency.state === stateFilter);
    }

    if (inputValue) {
      const inputLower = inputValue.toLowerCase();
      filtered = filtered.filter((agency) => {
        const name = agency?.name?.toLowerCase() || "";
        return name.includes(inputLower);
      });
    }

    // Get unique agency names
    let uniqueNames = [
      ...new Set(
        filtered.map((agency) => agency?.name || "").filter((name) => name)
      ),
    ];

    // If no input value (initial click), show only first 5 suggestions
    if (!inputValue) {
      uniqueNames = uniqueNames.slice(0, 5);
    }

    setAgencySuggestions(uniqueNames);
  };

  if (error) {
    return (
      <Typography color="error" align="center">
        Error loading agencies: {error}
      </Typography>
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
        overflowY: "scroll", // Always show scrollbar
        width: "100vw",
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
      <Typography
        align="center"
        sx={{
          mt: 10,
          p:2,
          mb:0.5,
          fontSize: {
            xs: "1rem",
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
         AGENCY DETAILS 
      </Typography>

      <Grid
        container
        spacing={1}
        sx={{
          mb: 0,
          mt:1,
          width: {
            xs: "100%",
            sm: "90%",
            md: "83%",
            lg: isBelow ? "70%" : "60%",
          },
          marginX: "auto",
          maxWidth: "100%",
        }}
      >
        {/* State Filter */}
        <Grid
          size={{ xs: 6, sm: 6, md: 4, lg: 3 }} // Adjusted size
          sx={{
            display: "flex",
            justifyContent: "left",
            alignItems: "stretch",
          }}
        >
          <Box
            sx={{
              width: { xs: "100%", sm: "100%", md: "100%" },
              paddingLeft: {xs:2, sm:2, md:0},
              mb: 2,
              textAlign: "left",
              position: "relative",
            }}
          >
            <Autocomplete
              options={["All States", ...states]}
              value={selectedState}
              onChange={(event, newValue) => {
                const newState = newValue || "All States";
                setSelectedState(newState);
                updateAgencySuggestions(agencyNameFilter, newState);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  // label="Filter by State"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        <Tooltip title="Use my current location">
                          <IconButton
                            onClick={handleUseCurrentLocation}
                            disabled={isLocating || loading}
                            size="small"
                            sx={{ mr: -1 }}
                          >
                            {isLocating ? (
                              <CircularProgress size={20} />
                            ) : (
                              <MyLocationIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "white",
                      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                      "& fieldset": {
                        borderColor: "transparent !important",
                      },
                      "&:hover fieldset": {
                        borderColor: "transparent",
                        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "transparent",
                        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
                      },
                      "&.Mui-disabled fieldset": {
                        borderColor: "transparent !important",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "inherit",
                    },
                    "& .MuiInputBase-input": {
                      fontSize: {
                        xs: "0.8rem",
                        sm: "0.8rem",
                        md: isBelow ? "0.9rem" : "1rem",
                        lg: isBelow ? "0.9rem" : "1rem",
                      },
                    },
                    width: "100%",
                  }}
                />
              )}
              sx={{
                "& .MuiAutocomplete-endAdornment": {
                  right: "10px",
                },
              }}
              disabled={loading}
            />
          </Box>
        </Grid>

        {/* Agency Name Filter */}
        <Grid
          size={{ xs: 6, sm: 6, md: 4, lg: 3 }}
          sx={{
            display: "flex",
            justifyContent: "left",
            alignItems: "stretch",
          }}
        >
          <Box
            sx={{
              width: { xs: "100%", sm: "75%", md: "100%" },
              paddingLeft: 0,
              mb: 2,
              paddingRight: {xs:2, sm:2, md:0},
              textAlign: "left",
              position: "relative",
            }}
          >
            <Autocomplete
              freeSolo
              options={agencySuggestions}
              value={agencyNameFilter}
              onChange={(event, newValue) => {
                setAgencyNameFilter(newValue || "");
              }}
              onInputChange={(event, newInputValue) => {
                setAgencyNameFilter(newInputValue);
                updateAgencySuggestions(newInputValue, selectedState);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Type to search agencies..."
                  InputLabelProps={{
                    shrink: false,
                    style: { display: "none" },
                  }}
                  inputProps={{
                    ...params.inputProps,
                    "aria-label": "Filter by Agency Name",
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "white",
                      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                      "& fieldset": {
                        borderColor: "transparent !important",
                      },
                      "&:hover fieldset": {
                        borderColor: "transparent",
                        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "transparent",
                        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
                      },
                      "& .MuiInputBase-input::placeholder": {
                        opacity: 1,
                        color: theme.palette.text.secondary,
                      },
                    },
                    "& .MuiInputBase-input": {
                      fontSize: {
                        xs: "0.8rem",
                        sm: "0.8rem",
                        md: isBelow ? "0.9rem" : "1rem",
                        lg: isBelow ? "0.9rem" : "1rem",
                      },
                      "&::placeholder": {
                        color: theme.palette.text.secondary,
                      },
                    },
                    width: "100%",
                  }}
                  disabled={loading}
                />
              )}
              noOptionsText={
                <Typography variant="body1" color="text.secondary">
                  {!agencyNameFilter && selectedState === "All States"
                    ? "Start typing to search agencies"
                    : selectedState === "All States" && agencyNameFilter
                    ? `No agencies found with name containing "${agencyNameFilter}"`
                    : !agencyNameFilter
                    ? `No agencies found in ${selectedState}`
                    : `No agencies found in ${selectedState} with name containing "${agencyNameFilter}"`}
                </Typography>
              }
              disabled={loading}
            />
          </Box>
        </Grid>

        {/* Clear Filters Button */}
        <Grid
          size={{ xs: 12, sm: 12, md: 4, lg: 2 }} // Adjusted size
          sx={{
            display: "flex",
            justifyContent: {xs: "center", sm: "center", md: "left"},
            alignItems: "stretch",
          }}
        >
          <Button
            onClick={() => {
              handleClearFilters();
              setAgencyNameFilter("");
              setAgencySuggestions([]);
            }}
            disableRipple
            disabled={
              (selectedState === "All States" && !agencyNameFilter) || loading
            }
            sx={{
              height: { xs: 30, sm: 30, md: 53.69 },
              paddingY: "9px",
              mb: 2,
              display: "flex",
              alignItems: "left",
              "&:hover": {
                backgroundColor: "transparent",
              },
              width: { xs: "50%", sm: "40%", md: "60%", lg: "100%" },
               fontSize: {xs: "0.78rem", sm: "0.78rem", md: "0.875rem"},
            }}
          >
            Clear Filters
          </Button>
        </Grid>
      </Grid>

      {locationError && (
        <Typography color="error" align="center" sx={{ mb: 2 }}>
          {locationError}
        </Typography>
      )}

      <Box
        sx={{
          width: {
            xs: "100%",
            sm: "90%",
            md: "83%",
            lg: isBelow ? "70%" : "60%",
          },
          marginX: "auto",
          height: loading ? "200px" : "auto",
          minHeight: loading
            ? "200px"
            : `${
                headerHeight +
                rowHeight * Math.min(paginatedAgencies.length, itemsPerPage)
              }px`,
          display: "flex",
          flexDirection: "column",
          borderRadius: 2,
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08)",
          mb: filteredAgencies.length > itemsPerPage ? 0 : 2,
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "200px",
              backgroundColor: "white",
              width: "100%",
              marginX: "auto",
            }}
          >
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading agency details...</Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ overflow: "hidden" }}>
            <Table aria-label="agencies table">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: "600",
                      backgroundColor: theme.palette.grey[50],
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      width: {xs:"60%", sm:"65%", md:"70%"}, // Agency Name column takes 70% width
                    }}
                  >
                    Agency Name
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "600",
                      backgroundColor: theme.palette.grey[50],
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      width: "30%", // Location column takes 30% width
                      pl:{xs:1, sm:1, md:2},
                    }}
                  >
                    Location
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedAgencies.length > 0 ? (
                  paginatedAgencies.map((agency) => (
                    <TableRow
                      key={agency.id}
                      hover
                      onClick={() => handleRowClick(agency)}
                      sx={{
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: theme.palette.grey[50],
                        },
                        "&:last-child td": {
                          borderBottom: 0,
                        },
                        height: rowHeight, // Set explicit row height
                      }}
                    >
                      <TableCell
                        sx={{
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          pl:2,
                          pr: 0,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            sx={{
                              width: avatarSize,
                              height: avatarSize,
                              mr: 1.5,
                              backgroundColor: agency?.isAddedAgency
                                ? theme.palette.success.light
                                : theme.palette.success.light,
                              fontSize: {xs: "0.6rem", sm: "0.6rem", md: "0.8rem"},
                            }}
                          >
                            {agency?.isAddedAgency ? (
                              <VolunteerActivismIcon fontSize="inherit" />
                            ) : (
                              <PublicIcon fontSize="inherit" />
                            )}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="body1"
                              fontWeight="500"
                              sx={{ fontSize: {xs: "0.78rem", sm: "0.78rem", md: "0.875rem"} }}
                            >
                              {agency?.name ||
                                agency?.agency_name ||
                                "Unknown Agency"}
                            </Typography>
                            {/* {agency?.isAddedAgency && (
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                Community-added
                              </Typography>
                            )} */}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          pl:{xs:1, sm:1, md:2},
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body1"
                            sx={{ fontSize: {xs: "0.78rem", sm: "0.78rem", md: "0.875rem"} }}
                          >
                            {agency?.city ||
                              agency?.district ||
                              "Location not specified"}
                            , {agency?.state || "State not specified"}
                          </Typography>
                          {/* <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            {agency?.state || 'State not specified'}
                          </Typography> */}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No agencies found matching your criteria
                      </Typography>
                      <Button
                        onClick={() => {
                          handleClearFilters();
                          setAgencyNameFilter("");
                          setAgencySuggestions([]);
                        }}
                        variant="text"
                        size="small"
                        sx={{ mt: 1 }}
                      >
                        Clear filters
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {filteredAgencies.length > 0 && (
        <Box
          sx={{
            width: {
              xs: "100%",
              sm: "90%",
              md: "83%",
              lg: isBelow ? "70%" : "60%",
            },
            marginX: "auto",
            display: "flex",
            justifyContent: "center",
            pt: 2,
            pb: 2,
          }}
        >
          <Pagination
            count={Math.ceil(filteredAgencies.length / itemsPerPage)}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size={isMobile ? "small" : "medium"}
          />
        </Box>
      )}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="agency-details-dialog"
        maxWidth="sm"
        fullWidth
      >
        {selectedAgency && (
          <>
            <DialogTitle id="agency-details-dialog" sx={{ fontSize: {xs: "0.9rem", sm: "0.97rem", md: "1.1rem"}, fontWeight: "bold" }}>
              {selectedAgency.name}
            </DialogTitle>
            <DialogContent >
              <DialogContentText >
                <Typography variant="subtitle1" gutterBottom sx={{ fontSize: {xs: "0.8rem", sm: "0.8rem", md: "0.9rem"} }}>
                  <strong>Location:</strong> {selectedAgency.city},{" "}
                  {selectedAgency.state}
                </Typography>
                {selectedAgency.address && (
                  <Typography variant="body1" gutterBottom sx={{ fontSize: {xs: "0.8rem", sm: "0.8rem", md: "0.9rem"} }}>
                    <strong>Address:</strong> {selectedAgency.address}
                  </Typography>
                )}
                {selectedAgency.telephone && (
                  <Typography variant="body1" gutterBottom sx={{ fontSize: {xs: "0.8rem", sm: "0.8rem", md: "0.9rem"} }}>
                    <strong>Phone:</strong> {selectedAgency.telephone}
                  </Typography>
                )}
                {selectedAgency.website && (
                  <Typography variant="body1" gutterBottom sx={{ fontSize: {xs: "0.8rem", sm: "0.8rem", md: "0.9rem"} }}>
                    <strong>Website:</strong>{" "}
                    <a
                      href={selectedAgency.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {selectedAgency.website}
                    </a>
                  </Typography>
                )}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Footer />
    </Box>
  );
};

export default Agencies;
