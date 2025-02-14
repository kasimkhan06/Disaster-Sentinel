import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Box, TextField, Button, Link } from "@mui/material";

const Verification = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setOtp(e.target.value);
    setError(""); // Clear error when typing
  };

  const handleSubmit = () => {
    if (!otp.trim()) {
      setError("OTP is required");
      return;
    }
    navigate("/login"); // Redirect to login page
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
        background: "linear-gradient(to bottom,rgb(100, 126, 139), rgb(210, 223, 248))",
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
          borderRadius: "12px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Typography variant="h6" fontWeight="bold"  gutterBottom>
          VERIFICATION
        </Typography>

        <Typography variant="body2" gutterBottom>
          We have sent an email to <strong>*****@gmail.com</strong>.<br />
          Please verify your email!
        </Typography>

        <Box mt={3} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }} >
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
  );
};

export default Verification;