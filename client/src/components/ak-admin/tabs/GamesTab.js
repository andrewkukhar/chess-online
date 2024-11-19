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

  const getGameType = (players) => {
    const aiPlayers = players?.filter((p) => p?.isAI);
    const humanPlayers = players?.filter((p) => !p?.isAI);
    if (aiPlayers?.length > 0 && humanPlayers?.length > 0) {
      return "Human vs AI";
    } else if (aiPlayers?.length > 0) {
      return "AI vs AI";
    } else {
      return "Human vs Human";
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
      field: "gameType",
      headerName: "Game Type",
      width: 150,
      valueGetter: (value, row) => getGameType(row?.players),
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 200,
      valueGetter: (value, row) => new Date(row.createdAt).toLocaleString(),
    },
    {
      field: "players",
      headerName: "Players",
      width: 200,
      valueGetter: (value, row) =>
        row.players
          .map((p) => {
            const username = p.player?.username || "AI";
            const aiDifficulty = p?.isAI ? `(${p?.difficultyLevel})` : "";
            return `${username} ${aiDifficulty}`;
          })
          .join(", "),
    },
    {
      field: "winner",
      headerName: "Winner",
      width: 150,
      valueGetter: (value, row) =>
        row.winner ? row.winner.username : "No Winner",
    },
    {
      field: "gameDuration",
      headerName: "Game Duration",
      width: 150,
      valueGetter: (value, row) => {
        const startTime = new Date(row?.createdAt);
        const lastMove = row?.moves?.[row?.moves?.length - 1];
        const endTime = lastMove ? new Date(lastMove?.timestamp) : new Date();
        const durationMs = endTime - startTime;
        const durationMinutes = Math.floor(durationMs / 60000);
        return `${durationMinutes} min`;
      },
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
