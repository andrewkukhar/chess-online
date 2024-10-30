// src/components/Register.js
import React, { useState } from "react";
import { useRegisterMutation } from "../../services/api-services/auth";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";

const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [registerMutation, { isLoading, error }] = useRegisterMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerMutation({
        email,
        username,
        password,
      });

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      console.error("Registration failed:", err);
    }
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
    </div>
  );
};

export default Register;
