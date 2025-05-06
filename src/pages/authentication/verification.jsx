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

  // Get the email passed via navigate()
  const location = useLocation();
  const email = location.state?.email; // Access the email passed in the state

  const handleChange = (e) => {
    setOtp(e.target.value);
    setError(""); // Clear error when typing
  };

  const handleSubmit = async () => {
    console.log("Submitting OTP...");

    if (!otp.trim()) {
      console.log("Error: OTP is empty");
      setError("OTP is required");
      return;
    }

    console.log("OTP entered:", otp);
    const cleanedEmail = email.trim(); // Trim the email to remove extra spaces
    console.log("Email being sent:", cleanedEmail); // Log the cleaned email

    console.log("Request Payload:", { email: cleanedEmail, otp: otp });

    try {
      const response = await axios.post(
        "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/auth/verify-otp/",
        { email: cleanedEmail, otp: otp },
        {
          withCredentials: true,

          //log the credentials
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("OTP Verification Success:", response.data);
      navigate("/login");
    } catch (err) {
      console.error("OTP Verification Failed:", err.response?.data || err);
      setError("frontent Invalid OTP or session expired");
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
        zIndex: 0, // Only needed if you have other elements with zIndex
      }}
    >
      <Box
        sx={{
          // background: "linear-gradient(to bottom,rgb(100, 126, 139), rgb(210, 223, 248))",
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
            // height: "auto",
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
            We have sent an email to <strong>{email}</strong>. <br />
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
            >
              Submit
            </Button>
          </Box>

          <Box mt={3}>
            <Typography variant="body2">
              Still can’t find the email? <br />
              <Link href="#">Resend OTP</Link>
            </Typography>
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
