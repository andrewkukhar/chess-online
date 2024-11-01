// src/components/Register.js
import React, { useState } from "react";
import { useRegisterMutation } from "../../services/api-services/auth";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Box,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";

const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [registerMutation, { isLoading, error }] = useRegisterMutation();
  const navigate = useNavigate();
  const [snackbarAlert, setSnackbarAlert] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email?.trim()) {
      setSnackbarAlert({
        open: true,
        message: "Player email is required.",
        severity: "error",
      });
      return;
    }
    if (!email?.trim()) {
      setSnackbarAlert({
        open: true,
        message: "Player username is required.",
        severity: "error",
      });
      return;
    }
    if (!email?.trim()) {
      setSnackbarAlert({
        open: true,
        message: "Player password is required.",
        severity: "error",
      });
      return;
    }
    const result = await registerMutation({
      email,
      username,
      password,
    });

    if (result && result?.data) {
      setSnackbarAlert({
        open: true,
        message: result?.data?.message || "Registered successfully.",
        severity: "success",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } else {
      console.error("Registration failed:", result?.error?.data?.message);
      setSnackbarAlert({
        open: true,
        message: result?.error?.data?.message || `Failed to register!`,
        severity: "error",
      });
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarAlert({ open: false, message: "", severity: "info" });
  };

  return (
    <div className="auth-page">
      <Typography component="h1" variant="h5">
        Register
      </Typography>
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
          type="password"
          id="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
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
      <Snackbar
        open={snackbarAlert.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarAlert.severity}
          sx={{ width: "100%" }}
        >
          {snackbarAlert.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Register;
