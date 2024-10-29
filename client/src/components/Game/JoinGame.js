// src/components/JoinGame.js
import React, { useState, useContext } from "react";
import { useJoinGameMutation } from "../../services/api-services/game";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Box,
  Typography,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { AuthContext } from "../../contexts/AuthContext";

const JoinGame = () => {
  const [gameId, setGameId] = useState("");
  const navigate = useNavigate();
  const { userId } = useContext(AuthContext);

  const [snackbarAlert, setSnackbarAlert] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const [joinGame, { isLoading }] = useJoinGameMutation();

  const handleJoinGame = async () => {
    if (!gameId.trim()) {
      setSnackbarAlert({
        open: true,
        message: `Please enter a valid game id!`,
        severity: "warning",
      });
      return;
    }
    const result = await joinGame({ gameId, playerId: userId });

    if (result?.data && result?.data?.game) {
      setSnackbarAlert({
        open: true,
        message: result?.data?.message || `Joined game successfully!`,
        severity: "success",
      });
      localStorage.setItem("currentGameId", result?.data?.game?._id);
      setTimeout(() => {
        navigate(`/game/${result?.data?.game?._id}`);
      }, 2000);
    } else {
      console.log("Error result:", result);
      setSnackbarAlert({
        open: true,
        message: result?.error?.data?.message || `Failed to join game!`,
        severity: "error",
      });
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarAlert({ open: false, message: "", severity: "info" });
  };

  return (
    <Box
      sx={{
        margin: "2rem auto",
        padding: "2rem",
        maxWidth: "500px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxShadow: 3,
        borderRadius: 2,
        justifyContent: "center",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Join an Existing Game
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Enter the Game ID below to join an ongoing game.
      </Typography>
      <TextField
        label="Game ID"
        variant="outlined"
        fullWidth
        value={gameId}
        onChange={(e) => setGameId(e.target.value)}
        sx={{ marginTop: "2rem", marginBottom: "1rem" }}
      />
      <Button
        variant="contained"
        color="secondary"
        onClick={handleJoinGame}
        disabled={!gameId.trim() || isLoading}
        sx={{ width: "100%", padding: "0.75rem" }}
      >
        {isLoading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          "Join Game"
        )}
      </Button>
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
    </Box>
  );
};

export default JoinGame;
