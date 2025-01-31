import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {Typography,Box,TextField,Button,Link,} from "@mui/material";
  
  const Verification = () => {
    const navigate = useNavigate();

    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
      setOtp(e.target.value);
      setError(""); // Remove error when user starts typing
    };

    const handleSubmit = () =>{
      if (!otp.trim()) {
        setError("OTP is required");
        return;
      }
      navigate("/login"); // Redirect to login page
    };

    const loginRedirect = () => {
      navigate("/login");
    };

    return (
      <Box
        sx={{
          background: "linear-gradient(to left,rgba(227, 208, 248, 0.78),rgb(168, 178, 197))",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          margin: 0,
          padding: 0,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: { xs: "100%", sm: "85%", md: "70%" },
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#fff",
          }}
        >
          <Box
            sx={{
              width: "80%",
              textAlign: "center",
            }}
          >
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Verification
            </Typography>
  
            <Typography variant="body1" gutterBottom>
              We have sent an email to <strong>username@gmail.com</strong>.<br />
              Please verify your email!
            </Typography>
  
            <Box mt={3}>
              <TextField fullWidth label="OTP" variant="outlined" value={otp} onChange={handleChange} error={!!error} helperText={error} sx={{ marginBottom: 2 }}/>
              <Button
                variant="contained"
                size="large"
                sx={{ textTransform: "uppercase", width: "25%", backgroundColor: "#4F646F" }}
                onClick={handleSubmit}
              >Submit
              </Button>
            </Box>
  
            <Box mt={2} textAlign="center">
              <Typography variant="body2">
                Still can’t find the email? <br/>
                <Link to="#">Resend OTP</Link>
              </Typography>
            </Box>
            {/* <Box mt={2} textAlign="center">
              <Typography variant="body2" mt={1}>
                Need help? <Link href="#">Contact us</Link>
              </Typography>
            </Box> */}
  
            <Box mt={4} textAlign="center">
              <Typography variant="body2">
                Already registered? 
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
  