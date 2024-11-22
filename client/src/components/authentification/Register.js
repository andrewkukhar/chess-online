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

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email?.trim()) {
      addNotification("Player email is required.", "error");
      return;
    }
    if (!validateEmail(email)) {
      addNotification("Please enter a valid email address.", "error");
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
    if (password.length < 6) {
      addNotification("Password must be at least 6 characters long.", "error");
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
            error={email && !validateEmail(email)}
            helperText={
              email && !validateEmail(email)
                ? "Please enter a valid email address."
                : ""
            }
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
            error={username && username.length < 3}
            helperText={
              username && username.length < 3
                ? "Username must be at least 3 characters long."
                : ""
            }
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
            error={password && password.length < 6}
            helperText={
              password && password.length < 6
                ? "Password must be at least 6 characters long."
                : ""
            }
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={
              isLoading ||
              !email ||
              !username ||
              username.length < 3 ||
              password.length < 6 ||
              !validateEmail(email)
            }
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
