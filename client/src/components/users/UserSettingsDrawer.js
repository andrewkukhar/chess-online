// src/components/UserSettingsDrawer.js
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { NotificationContext } from "../../contexts/NotificationContext";
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  useGetUserByIdQuery,
  useUpdateUserByIdMutation,
} from "../../services/api-services/user";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const UserSettingsDrawer = ({ handleClose }) => {
  const { userId, handleLogin } = useContext(AuthContext);
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserByIdMutation();
  const {
    data: user,
    isLoading,
    refetch,
  } = useGetUserByIdQuery(userId, {
    skip: !userId,
  });
  const { addNotification } = useContext(NotificationContext);

  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setFirstname(user.firstname || "");
      setLastname(user.lastname || "");
      setUsername(user.username || "");
    }
  }, [user]);

  const handleUpdateUser = async () => {
    if (newPassword !== confirmPassword) {
      addNotification("New passwords do not match.", "error");
      return;
    }

    const userData = {};
    if (email) userData.email = email;
    if (firstname) userData.firstname = firstname;
    if (lastname) userData.lastname = lastname;
    if (username) userData.username = username;
    if (oldPassword && newPassword) {
      userData.oldPassword = oldPassword;
      userData.newPassword = newPassword;
    }
    const result = await updateUser({ userId, userData });

    if (result && result?.data) {
      addNotification(
        result?.data?.message || "User updated successfully.",
        "success"
      );
      if (username !== user.username) {
        handleLogin({
          token: localStorage.getItem("token"),
          userId,
          username,
          userrole: user.userrole,
        });
      }

      setTimeout(() => {
        refetch?.();
        handleClose();
      }, 1500);
    } else {
      addNotification(
        result?.error?.data?.message ||
          "Failed to update user. Please try again.",
        "error"
      );
    }
  };

  const handleToggleOldPasswordVisibility = () => {
    setShowOldPassword((prev) => !prev);
  };

  const handleToggleNewPasswordVisibility = () => {
    setShowNewPassword((prev) => !prev);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  return isLoading ? (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <CircularProgress />
    </Box>
  ) : (
    <Box sx={{ width: "95%", padding: 1 }}>
      <Typography variant="h6" gutterBottom>
        Account Settings
      </Typography>
      <Divider sx={{ m: 0, p: 0, marginBottom: 2 }} />
      <TextField
        label="New Email"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ m: 0, p: 0, marginBottom: 2 }}
      />
      <TextField
        label="Old Password"
        fullWidth
        type={showOldPassword ? "text" : "password"}
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
        sx={{ m: 0, p: 0, marginBottom: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleToggleOldPasswordVisibility}
                edge="end"
              >
                {showOldPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <TextField
        label="New Password"
        fullWidth
        type={showNewPassword ? "text" : "password"}
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        sx={{ m: 0, p: 0, marginBottom: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleToggleNewPasswordVisibility}
                edge="end"
              >
                {showNewPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <TextField
        label="Confirm New Password"
        fullWidth
        type={showConfirmPassword ? "text" : "password"}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        sx={{ m: 0, p: 0, marginBottom: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleToggleConfirmPasswordVisibility}
                edge="end"
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <TextField
        label="First Name"
        fullWidth
        value={firstname}
        onChange={(e) => setFirstname(e.target.value)}
        sx={{ m: 0, p: 0, marginBottom: 2 }}
      />
      <TextField
        label="Last Name"
        fullWidth
        value={lastname}
        onChange={(e) => setLastname(e.target.value)}
        sx={{ m: 0, p: 0, marginBottom: 2 }}
      />
      <TextField
        label="Username"
        fullWidth
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        sx={{ m: 0, p: 0, marginBottom: 2 }}
      />
      <div style={{ display: "flex", gap: "0 1rem", width: "100%" }}>
        <Button
          onClick={handleClose}
          variant="contained"
          color="secondary"
          sx={{ width: "30%" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpdateUser}
          disabled={isUpdating}
          sx={{ width: "70%" }}
        >
          {isUpdating ? <CircularProgress /> : "Update Account"}
        </Button>
      </div>
    </Box>
  );
};

export default UserSettingsDrawer;
