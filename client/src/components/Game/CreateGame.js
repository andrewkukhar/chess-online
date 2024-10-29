// src/components/CreateGame.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateGameMutation } from "../../services/api-services/game";
import {
  Button,
  Box,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  TextField,
} from "@mui/material";

const CreateGame = () => {
  const navigate = useNavigate();

  const [gameName, setGameName] = useState("");
  const [snackbarAlert, setSnackbarAlert] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const [createGame, { isLoading }] = useCreateGameMutation();

  const handleCreateNewGame = async () => {
    if (!gameName.trim()) {
      setSnackbarAlert({
        open: true,
        message: `Please enter a valid game name!`,
        severity: "warning",
      });
      return;
    }
    const result = await createGame(gameName);

    if (result?.data && result?.data?.game) {
      setSnackbarAlert({
        open: true,
        message: result?.data?.message || `Game created successfully!`,
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
        message: result?.error?.data?.message || `Failed to create game!`,
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
        Create a New Game
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Enter a name for your game session.
      </Typography>
      <TextField
        label="Game Name"
        variant="outlined"
        fullWidth
        value={gameName}
        onChange={(e) => setGameName(e.target.value)}
        sx={{ marginTop: "2rem", marginBottom: "1rem" }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateNewGame}
        disabled={isLoading}
        sx={{ marginTop: "2rem", width: "100%", padding: "0.75rem" }}
      >
        {isLoading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          "Create Game"
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

export default CreateGame;
