import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Box, TextField, Button, Link } from "@mui/material";
import axios from "axios";
import { useLocation } from "react-router-dom"; // Import useLocation
import worldMapBackground from "/assets/background_image/world-map-background.jpg";

const Verification = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState(""); // State for resend OTP message

  // Get the email passed via navigate()
  const location = useLocation();
  const email = location.state?.email; // Access the email passed in the state

  const handleChange = (e) => {
    setOtp(e.target.value);
    setError(""); // Clear error when typing
  };

  const handleSubmit = async () => {
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
      const response = await axios.post(
        "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/auth/verify-otp/",
        { email: email.trim(), otp: otp }, // Now safe to call trim()
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("OTP Verification Success:", response.data);
      navigate("/login");
    } catch (err) {
      console.error("OTP Verification Failed:", err.response?.data || err);
      setError("Invalid OTP or session expired");
    }
  };

  const resendOtp = async () => {
    // Check if email is available and is a string before trimming
    if (!email || typeof email !== 'string') {
      setResendMessage("Email address is not available. Cannot resend OTP.");
      console.error("Resend OTP Failed: Email is undefined or not a string.");
      return;
    }

    try {
      const response = await axios.post(
        "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/auth/resend-otp/",
        { email: email.trim() }, // Now safe to call trim()
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Resend OTP Success:", response.data);
      setResendMessage("A new OTP has been sent to your email.");
    } catch (err) {
      console.error("Resend OTP Failed:", err.response?.data || err);
      setResendMessage("Failed to resend OTP. Please try again later.");
    }
  };

  const loginRedirect = () => {
    navigate("/login");
  };

  useEffect(() => {
    document.body.style.margin = "0";
    return () => {
      document.body.style.margin = ""; // Restore original margin on unmount
    };
  }, []);

  // Optional: You could also add a check here to see if email exists on mount
  // and guide the user if it doesn't, though this might be a UI change.
  // useEffect(() => {
  //   if (!email) {
  //     setError("No email address found. Please return to the previous page and try again.");
  //     // Potentially disable inputs or redirect
  //   }
  // }, [email]);

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
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 0,
          margin: 0,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: { xs: "90%", sm: "50%", md: "40%" },
            minHeight: "60vh",
            backgroundColor: "#fff",
            paddingTop: "10px",
            borderRadius: 2,
            boxShadow: 3,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            VERIFICATION
          </Typography>

          <Typography variant="body1" gutterBottom>
            We have sent an email to <strong>{email || "your email address"}</strong> <br /> {/* Fallback for display */}
            Please verify your email!
          </Typography>

          <Box
            mt={3}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <TextField
              label="OTP"
              variant="outlined"
              value={otp}
              onChange={handleChange}
              error={!!error}
              helperText={error}
              sx={{ width: "40%", marginBottom: 1 }}
              inputProps={{
                inputMode: "numeric", // Ensures numeric keyboard on mobile devices
                pattern: "[0-9]*", // Restricts input to numbers
              }}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault(); // Prevent non-numeric characters
                }
              }}
            />
            <Button
              variant="contained"
              sx={{
                mt: 2,
                textTransform: "uppercase",
                width: "15%",
                backgroundColor: "#4F646F",
              }}
              onClick={handleSubmit}
              disabled={!email} // Optionally disable button if email is not present
            >
              Submit
            </Button>
          </Box>

          <Box mt={3}>
            <Typography variant="body2">
              Still can’t find the email? <br />
              <Button variant="text" onClick={resendOtp} disabled={!email}> {/* Optionally disable button */}
                Resend OTP
              </Button>
            </Typography>
            {resendMessage && (
              <Typography variant="body2" color="textSecondary" mt={1}>
                {resendMessage}
              </Typography>
            )}
          </Box>

          <Box mt={2}>
            <Typography variant="body2">
              Already registered?{" "}
              <Button variant="text" onClick={loginRedirect}>
                Login
              </Button>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Verification;