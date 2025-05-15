import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Box, TextField, Button } from "@mui/material"; // Removed Link as it wasn't used
import axios from "axios";
import { useLocation } from "react-router-dom";
import worldMapBackground from "/assets/background_image/world-map-background.jpg";

const Verification = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState(""); // State for resend OTP message

  // Get the email passed via navigate()
  const location = useLocation();
  const email = location.state?.email; // Access the email passed in the state

  // Handle OTP input change
  const handleChange = (e) => {
    setOtp(e.target.value);
    setError(""); // Clear error when typing
  };

  // Handle OTP submission
  const handleSubmit = async () => {
    // Validate OTP input
    if (!otp.trim()) {
      setError("OTP is required");
      return;
    }

    // Check if email is available and is a string before trimming
    if (!email || typeof email !== 'string') {
      setError("Email address is not available. Cannot verify OTP.");
      console.error("OTP Verification Failed: Email is undefined or not a string.");
      return;
    }

    try {
      // API call to verify OTP
      const response = await axios.post(
        "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/auth/verify-otp/",
        { email: email.trim(), otp: otp }, // Send email and OTP
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("OTP Verification Success:", response.data);
      navigate("/login"); // Navigate to login on successful verification
    } catch (err) {
      console.error("OTP Verification Failed:", err.response?.data || err.message || err);
      setError(err.response?.data?.detail || "Invalid OTP or session expired. Please try again.");
    }
  };

  // Handle OTP resend request
  const resendOtp = async () => {
    // Clear previous messages
    setResendMessage("");
    setError("");

    // Check if email is available and is a string before trimming
    if (!email || typeof email !== 'string') {
      setResendMessage("Email address is not available. Cannot resend OTP.");
      console.error("Resend OTP Failed: Email is undefined or not a string.");
      return;
    }

    try {
      // API call to resend OTP
      const response = await axios.post(
        "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/auth/resend-otp/",
        { email: email.trim() }, // Send email
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Resend OTP Success:", response.data);
      setResendMessage(response.data?.message || "A new OTP has been sent to your email.");
    } catch (err) {
      console.error("Resend OTP Failed:", err.response?.data || err.message || err);
      // Display a more specific error from backend if available, otherwise a generic one
      setResendMessage(err.response?.data?.detail || "Failed to resend OTP. Please check your email or try again later.");
    }
  };

  // Navigate to login page
  const loginRedirect = () => {
    navigate("/login");
  };

  // Effect to set body margin (full screen background)
  useEffect(() => {
    document.body.style.margin = "0";
    return () => {
      document.body.style.margin = ""; // Restore original margin on unmount
    };
  }, []);

  // Optional: Effect to check for email on mount and guide user if missing
  useEffect(() => {
    if (!email) {
       // Set an error message or resend message to inform the user
      setError("Email address not found. Please go back and try the process again.");
      // Optionally, you could disable the OTP input field as well
    }
  }, [email]);


  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        width: "100%", // Ensure full width
        minHeight: "100vh",
        background: `
              linear-gradient(rgba(255, 255, 255, 0.90), rgba(255, 255, 255, 0.90)),
              url(${worldMapBackground})
            `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat", // Changed from repeat-y for better full cover
        margin: 0,
        padding: 0,
        zIndex: 0, // Ensure background is behind content
        display: "flex", // Added for centering the inner box
        justifyContent: "center", // Added for centering
        alignItems: "center", // Added for centering
      }}
    >
      {/* Removed the intermediate Box as the outer Box now handles centering */}
      <Box
        sx={{
          width: { xs: "90%", sm: "50%", md: "40%", lg: "30%" }, // Responsive width
          maxWidth: "500px", // Max width for very large screens
          minHeight: "auto", // Adjusted minHeight
          backgroundColor: "rgba(255, 255, 255, 0.95)", // Slightly more opaque for readability
          padding: { xs: "20px", sm: "30px", md: "40px" }, // Responsive padding
          borderRadius: 2, // Standard border radius
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)", // Softer shadow
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 2, // Adds space between child elements
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: "#333" }}>
          VERIFICATION
        </Typography>

        <Typography variant="body1" gutterBottom sx={{ color: "#555" }}>
          We have sent an email to{" "}
          <strong>{email || "your email address"}</strong>. <br />
          Please enter the OTP to verify your email.
        </Typography>

        <Box
          component="form" // Semantic form element
          onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} // Handle submit on form
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%", // Ensure form elements can be full width if needed
            gap: 2, // Space between TextField and Button
          }}
        >
          <TextField
            label="OTP"
            variant="outlined"
            value={otp}
            onChange={handleChange}
            error={!!error} // Boolean to show error state
            helperText={error} // Display error message
            sx={{ width: {xs: "80%", sm: "60%"} }} // Responsive width for OTP field
            inputProps={{
              inputMode: "numeric", // Ensures numeric keyboard on mobile devices
              pattern: "[0-9]*", // Restricts input to numbers
              maxLength: 6, // Common OTP length
              style: { textAlign: 'center', fontSize: '1.2rem' } // Center text and increase size
            }}
            onKeyPress={(e) => {
              // Allow only numbers
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
              }
            }}
            // Disable if email is not present
            disabled={!email}
          />
          <Button
            type="submit" // Submit form on click
            variant="contained"
            sx={{
              textTransform: "uppercase",
              width: {xs: "60%", sm: "40%"}, // Responsive width
              backgroundColor: "#4F646F",
              '&:hover': {
                backgroundColor: "#3E505A",
              },
              padding: "10px 0", // More padding
              fontSize: "0.9rem"
            }}
            // Disable if email is not present
            disabled={!email}
          >
            Submit
          </Button>
        </Box>

        <Box mt={2}> {/* Adjusted margin */}
          <Typography variant="body2" sx={{ color: "#555" }}>
            Still haven’t received the email? <br />
            <Button 
              variant="text" 
              onClick={resendOtp}
              sx={{ 
                textTransform: "none", // Keep casing as is
                color: "#4F646F",
                '&:hover': {
                  backgroundColor: "rgba(79, 100, 111, 0.1)",
                }
              }}
              // Disable if email is not present
              disabled={!email}
            >
              Resend OTP
            </Button>
          </Typography>
          {resendMessage && (
            <Typography 
              variant="body2" 
              color={resendMessage.startsWith("Failed") || resendMessage.startsWith("Email address is not available") ? "error" : "textSecondary"} // Conditional color
              mt={1}
              sx={{ fontWeight: "500" }}
            >
              {resendMessage}
            </Typography>
          )}
        </Box>

        <Box mt={1}> {/* Adjusted margin */}
          <Typography variant="body2" sx={{ color: "#555" }}>
            Already registered?{" "}
            <Button 
              variant="text" 
              onClick={loginRedirect}
              sx={{ 
                textTransform: "none", 
                color: "#4F646F",
                '&:hover': {
                  backgroundColor: "rgba(79, 100, 111, 0.1)",
                }
              }}
            >
              Login
            </Button>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Verification;
