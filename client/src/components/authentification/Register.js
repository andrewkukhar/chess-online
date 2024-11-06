// src/components/Register.js
import React, { useState, useContext } from "react";
import { NotificationContext } from "../../contexts/NotificationContext";
import { useRegisterMutation } from "../../services/api-services/auth";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const Register = () => {
  const { addNotification } = useContext(NotificationContext);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [registerMutation, { isLoading, error }] = useRegisterMutation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email?.trim()) {
      addNotification("Player email is required.", "error");
      return;
    }
    if (!username?.trim()) {
      addNotification("Player username is required.", "error");
      return;
    }
    if (!password?.trim()) {
      addNotification("Player password is required.", "error");
      return;
    }

    const result = await registerMutation({
      email,
      username,
      password,
    });

    if (result && result?.data) {
      addNotification(
        result?.data?.message || "Registered successfully.",
        "success"
      );
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } else {
      console.error("Registration failed:", result?.error?.data?.message);
      addNotification(
        result?.error?.data?.message || `Failed to register!`,
        "error"
      );
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="auth-page">
      <Typography component="h1" variant="h5">
        Register
      </Typography>
      <div className="auth-page-body">
        {error && (
          <Alert severity="error" sx={{ width: "100%", mt: 2 }}>
            {error.data?.message || "Registration failed. Please try again."}
          </Alert>
        )}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 1, width: "100%" }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="username"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              className: "MuiTextField-root",
            }}
            InputLabelProps={{
              className: "MuiInputLabel-root",
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            InputProps={{
              className: "MuiTextField-root",
            }}
            InputLabelProps={{
              className: "MuiInputLabel-root",
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              className: "MuiTextField-root",
            }}
            InputLabelProps={{
              className: "MuiInputLabel-root",
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={isLoading}
            sx={{ mt: 3, mb: 2 }}
          >
            {isLoading ? <CircularProgress /> : "Register"}
          </Button>
        </Box>
      </div>
    </div>
  );
};

export default Register;
