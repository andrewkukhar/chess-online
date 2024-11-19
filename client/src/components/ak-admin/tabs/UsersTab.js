// src/components/ak-admin/tabs/UsersTab.js
import React, { useState, useContext } from "react";
import { NotificationContext } from "../../../contexts/NotificationContext";
import {
  useGetAllUsersQuery,
  useDeleteUserByIdMutation,
} from "../../../services/api-services/user";
import { CircularProgress, IconButton, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EditUserDialog from "../forms/EditUserDialog";
import ConfirmationDialog from "../../../helpers/ConfirmationDialog";

const UsersTab = () => {
  const { addNotification } = useContext(NotificationContext);
  const { data: users, isLoading, refetch } = useGetAllUsersQuery();
  const [deleteUserById] = useDeleteUserByIdMutation();
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  // console.log("users", users);
  const handleOpenEditDialog = (user) => {
    setSelectedUser(user);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setSelectedUser(null);
    setOpenEditDialog(false);
  };

  const handleOpenConfirmDialog = (userId) => {
    setUserIdToDelete(userId);
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setUserIdToDelete(null);
    setOpenConfirmDialog(false);
  };

  const rows =
    users?.map((user) => ({
      ...user,
      id: user?._id,
    })) || [];

  const handleConfirmDeleteUser = async () => {
    if (!userIdToDelete) {
      addNotification(`User ID is missing.`, "error");
      return;
    }

    const result = await deleteUserById(userIdToDelete);
    if (result && result?.data) {
      addNotification(
        result?.data?.message || "User deleted successfully.",
        "success"
      );
      setTimeout(() => {
        refetch?.();
        handleCloseConfirmDialog();
      }, 500);
    } else {
      console.log("Error result:", result);
      addNotification(
        result?.error?.data?.message || `Failed to delete user!`,
        "error"
      );
    }
  };

  const columns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <>
          <IconButton
            color="primary"
            onClick={() => handleOpenEditDialog(params.row)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleOpenConfirmDialog(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
    { field: "username", headerName: "Name", width: 150 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "firstname", headerName: "First Name", width: 150 },
    { field: "lastname", headerName: "Last Name", width: 150 },
    { field: "role", headerName: "Role", width: 150 },
  ];

  return (
    <div className="data-grid">
      {rows && rows?.length > 0 ? (
        <DataGrid
          rows={rows}
          columns={columns}
          checkboxSelection
          disableRowSelectionOnClick
          sx={{
            color: "#ffffff",
            ".MuiDataGrid-cell": {
              color: "#ffffff",
            },
            ".MuiDataGrid-columnHeaders": {
              color: "#000",
            },
          }}
        />
      ) : isLoading ? (
        <CircularProgress />
      ) : (
        <Typography variant="h5" gutterBottom>
          Admin Dashboard
        </Typography>
      )}
      <EditUserDialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        user={selectedUser}
        refetchUsers={refetch}
      />
      <ConfirmationDialog
        open={openConfirmDialog}
        title="Delete User"
        content="Are you sure you want to delete this user? This action cannot be undone."
        onConfirm={handleConfirmDeleteUser}
        onCancel={handleCloseConfirmDialog}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default UsersTab;
