// src/components/Game/OnlineLanding.js
import React, { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import {
  useGetAllGamesQuery,
  useLeaveGameMutation,
  useRemoveGameMutation,
} from "../services/api-services/game";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Link } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

const OnlineLanding = () => {
  const { token, isTokenReady, userId } = useContext(AuthContext);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: null,
    gameId: null,
  });

  const {
    data: gamesData,
    isLoading,
    isError,
  } = useGetAllGamesQuery(undefined, {
    skip: !isTokenReady || !userId | !token,
  });

  const [leaveGame] = useLeaveGameMutation();
  const [removeGame] = useRemoveGameMutation();

  const handleLeaveGame = async (gameId) => {
    await leaveGame({ gameId, playerId: userId });
    setConfirmDialog({ open: false, action: null, gameId: null });
  };

  const handleRemoveGame = async (gameId) => {
    await removeGame(gameId);
    setConfirmDialog({ open: false, action: null, gameId: null });
  };

  const openConfirmDialog = (action, gameId) => {
    setConfirmDialog({ open: true, action, gameId });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, action: null, gameId: null });
  };

  return (
    <div className="online-landing-page">
      <Typography variant="h4" gutterBottom>
        Play Online
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Choose an option below to start your game.
      </Typography>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          mt: 2,
        }}
      >
        <Tooltip title="Create a new game session" placement="top">
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/create"
            fullWidth
          >
            Create Game
          </Button>
        </Tooltip>
        <Tooltip title="Join an existing game session" placement="top">
          <Button
            variant="contained"
            color="secondary"
            component={Link}
            to="/join"
            fullWidth
          >
            Join Game
          </Button>
        </Tooltip>
      </Box>

      <Typography variant="h5" sx={{ mt: 4 }}>
        Your Games
      </Typography>
      {isLoading ? (
        <CircularProgress sx={{ mt: 2 }} />
      ) : isError ? (
        <Typography variant="body1" color="error" sx={{ mt: 2 }}>
          Error loading games.
        </Typography>
      ) : gamesData && gamesData.length > 0 ? (
        <Box
          sx={{
            mt: 2,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {gamesData.map((game) => (
            <Box
              key={game._id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.5rem 1rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            >
              <Typography>{game.name || `Game ${game._id}`}</Typography>
              <Box>
                <Tooltip title="Leave Game" placement="top">
                  <IconButton
                    color="warning"
                    onClick={() => openConfirmDialog("leave", game._id)}
                  >
                    <ExitToAppIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Remove Game" placement="top">
                  <IconButton
                    color="error"
                    onClick={() => openConfirmDialog("remove", game._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No games found.
        </Typography>
      )}
      <Dialog
        open={confirmDialog.open}
        onClose={closeConfirmDialog}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            Are you sure you want to {confirmDialog.action} this game?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() =>
              confirmDialog.action === "leave"
                ? handleLeaveGame(confirmDialog.gameId)
                : handleRemoveGame(confirmDialog.gameId)
            }
            color="error"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OnlineLanding;
