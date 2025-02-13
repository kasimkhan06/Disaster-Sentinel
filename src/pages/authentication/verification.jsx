import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Box, TextField, Button, Link } from "@mui/material";
import axios from "axios";
import { useLocation } from "react-router-dom"; // Import useLocation



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
          credentials: 'include'
          //log the credentials
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
        background: "linear-gradient(to bottom, #4F646F, rgb(168, 178, 197))",
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
          width: { xs: "100%", sm: "70%", md: "40%" },
          height: "auto",
          minHeight: "60vh",
          backgroundColor: "#fff",
          padding: "50px",
          borderRadius: "12px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Verification
        </Typography>

        <Typography variant="body1" gutterBottom>
          We have sent an email to <strong>{email}</strong>. <br />
          Please verify your email!
        </Typography>

        <Box mt={3}>
          <TextField
            label="OTP"
            variant="outlined"
            value={otp}
            onChange={handleChange}
            error={!!error}
            helperText={error}
            sx={{ width: "70%", marginBottom: 2 }}
          />
          <Button
            variant="contained"
            size="large"
            sx={{
              textTransform: "uppercase",
              width: "35%",
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

        <Box mt={3}>
          <Typography variant="body2">
            Already registered?{" "}
            <Button variant="text" onClick={loginRedirect}>
              Login
            </Button>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Verification;
