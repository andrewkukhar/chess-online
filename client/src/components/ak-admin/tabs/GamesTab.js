import React, { useState, useContext } from "react";
import {
  useGetAllGamesQuery,
  useRemoveGameMutation,
  useRemoveAllGamesMutation,
} from "../../../services/api-services/game";
import {
  CircularProgress,
  Box,
  IconButton,
  Button,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { NotificationContext } from "../../../contexts/NotificationContext";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmationDialog from "../../../helpers/ConfirmationDialog";

const GamesTab = () => {
  const { addNotification } = useContext(NotificationContext);
  const { data: games, isLoading, refetch } = useGetAllGamesQuery();
  const [removeGame] = useRemoveGameMutation();
  const [removeAllGames] = useRemoveAllGamesMutation();
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [gameIdToDelete, setGameIdToDelete] = useState(null);
  const [openDeleteAllDialog, setOpenDeleteAllDialog] = useState(false);

  const rows =
    games?.map((game) => ({
      ...game,
      id: game?._id,
    })) || [];

  const handleOpenConfirmDialog = (gameId) => {
    setGameIdToDelete(gameId);
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setGameIdToDelete(null);
    setOpenConfirmDialog(false);
  };

  const handleConfirmDeleteGame = async () => {
    if (!gameIdToDelete) {
      addNotification(`Game ID is missing.`, "error");
      return;
    }
    const result = await removeGame(gameIdToDelete);
    if (result && result?.data) {
      addNotification(
        result?.data?.message || "Game deleted successfully.",
        "success"
      );
      setTimeout(() => {
        refetch?.();
        handleCloseConfirmDialog();
      }, 500);
    } else {
      console.log("Error result:", result);
      addNotification(
        result?.error?.data?.message || `Failed to delete game!`,
        "error"
      );
    }
  };

  const handleDeleteAllGames = async () => {
    const result = await removeAllGames();
    if (result && result?.data) {
      addNotification(
        result?.data?.message || "All games deleted successfully.",
        "success"
      );
      setTimeout(() => {
        refetch?.();
        setOpenDeleteAllDialog(false);
      }, 500);
    } else {
      console.log("Error result:", result);
      addNotification(
        result?.error?.data?.message || `Failed to delete games!`,
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
            color="error"
            onClick={() => handleOpenConfirmDialog(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
    { field: "name", headerName: "Name", width: 150 },
    { field: "status", headerName: "Status", width: 150 },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 200,
      valueGetter: (value, row) => new Date(row.createdAt).toLocaleString(),
    },
    {
      field: "players",
      headerName: "Players",
      width: 300,
      valueGetter: (value, row) =>
        row.players.map((p) => p.player?.username).join(", "),
    },
    {
      field: "winner",
      headerName: "Winner",
      width: 150,
      valueGetter: (value, row) =>
        row.winner ? row.winner.username : "No Winner",
    },
    {
      field: "lastMove",
      headerName: "Last Move",
      width: 150,
      valueGetter: (value, row) =>
        row.lastMove
          ? `From: ${row.lastMove.from}, To: ${row.lastMove.to}`
          : "None",
    },
    {
      field: "moveCount",
      headerName: "Total Moves",
      width: 150,
      valueGetter: (value, row) => row.moves?.length || 0,
    },
  ];

  return (
    <div className="data-grid">
      <Box sx={{ width: "100%", m: 1, p: 1 }}>
        <Button
          variant="outlined"
          color="error"
          onClick={() => setOpenDeleteAllDialog(true)}
          disabled={!rows || rows.length === 0}
          sx={{ mt: 2 }}
        >
          Delete All Games
        </Button>
      </Box>
      {rows && rows.length > 0 ? (
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
          No games found.
        </Typography>
      )}
      <ConfirmationDialog
        open={openConfirmDialog}
        title="Delete Game"
        content="Are you sure you want to delete this game? This action cannot be undone."
        onConfirm={handleConfirmDeleteGame}
        onCancel={handleCloseConfirmDialog}
        confirmText="Delete"
        cancelText="Cancel"
      />
      <ConfirmationDialog
        open={openDeleteAllDialog}
        title="Delete All Games"
        content="Are you sure you want to delete all games? This action cannot be undone."
        onConfirm={handleDeleteAllGames}
        onCancel={() => setOpenDeleteAllDialog(false)}
        confirmText="Delete All"
        cancelText="Cancel"
      />
    </div>
  );
};

export default GamesTab;
