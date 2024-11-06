// src/components/ak-admin/forms/EditUserDialog.js
import React, { useState, useEffect, useContext } from "react";
import { NotificationContext } from "../../../contexts/NotificationContext";
import { useUpdateUserByIdMutation } from "../../../services/api-services/user";
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from "@mui/material";

const EditUserDialog = ({ open, onClose, user, refetchUsers }) => {
  const { addNotification } = useContext(NotificationContext);
  const [updateUserById, { isLoading }] = useUpdateUserByIdMutation();
  const [editUserData, setEditUserData] = useState({});

  useEffect(() => {
    if (user) {
      setEditUserData(user);
    }
  }, [user]);

  const handleEditUserChange = (e) => {
    const { name, value } = e.target;
    setEditUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditUserSubmit = async () => {
    if (!user?.id) {
      addNotification(`User ID is missing.`, "error");
      return;
    }

    const { id, ...userData } = editUserData;
    const result = await updateUserById({ userId: id, userData });
    if (result && result?.data) {
      addNotification(
        result?.data?.message || "User updated successfully.",
        "success"
      );
      setTimeout(() => {
        onClose();
        refetchUsers?.();
      }, 1500);
    } else {
      console.log("Error result:", result);
      addNotification(
        result?.error?.data?.message || `Failed to update user!`,
        "error"
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Username"
          name="username"
          value={editUserData.username || ""}
          onChange={handleEditUserChange}
          fullWidth
        />
        <TextField
          margin="dense"
          label="Email"
          name="email"
          value={editUserData.email || ""}
          onChange={handleEditUserChange}
          fullWidth
        />
        <TextField
          margin="dense"
          label="Role"
          name="role"
          value={editUserData.role || ""}
          onChange={handleEditUserChange}
          fullWidth
        />
        <TextField
          margin="dense"
          label="First Name"
          name="firstname"
          value={editUserData.firstname || ""}
          onChange={handleEditUserChange}
          fullWidth
        />
        <TextField
          margin="dense"
          label="Last Name"
          name="lastname"
          value={editUserData.lastname || ""}
          onChange={handleEditUserChange}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={handleEditUserSubmit}
          color="primary"
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserDialog;
