// src/components/Login.js
import React, { useState, useContext } from "react";
import { useLoginMutation } from "../../services/api-services/auth";
import { AuthContext } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Tooltip,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const Login = () => {
  const { handleLogin } = useContext(AuthContext);
  const [loginMutation, { isLoading, error }] = useLoginMutation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginMutation({ email, password }).unwrap();
      const { token, user } = response;
      const { userId, username, userrole } = user;

      handleLogin({ token, userId, username, userrole });
      setTimeout(() => {
        navigate("/online");
      }, 1000);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="auth-page">
      <Typography component="h1" variant="h5">
        Login
      </Typography>
      <div className="auth-page-body">
        {error && (
          <Alert severity="error" sx={{ width: "100%", mt: 2 }}>
            {error.data?.message || "Login failed. Please try again."}
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
            autoComplete="email"
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
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="current-password"
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
          <Tooltip
            title="Don't Have an account? Go!, and create one"
            placement="left"
          >
            <Button
              color="inherit"
              component={Link}
              to="/register"
              sx={{
                fontSize: "0.75rem",
                color: "#fff",
                ":hover ": {
                  color: "#050505",
                },
              }}
            >
              Don't Have an account | Create One
            </Button>
          </Tooltip>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={isLoading}
            sx={{ mt: 3, mb: 2 }}
          >
            {isLoading ? <CircularProgress /> : "Login"}
          </Button>
        </Box>
      </div>
    </div>
  );
};

export default Login;
