// src/components/JoinGame.js
import React, { useState, useContext } from "react";
import { useJoinGameMutation } from "../../services/api-services/game";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Box,
  Typography,
  TextField,
  CircularProgress,
} from "@mui/material";
import { AuthContext } from "../../contexts/AuthContext";
import { NotificationContext } from "../../contexts/NotificationContext";

const JoinGame = () => {
  const { addNotification } = useContext(NotificationContext);
  const [gameId, setGameId] = useState("");
  const navigate = useNavigate();
  const { userId } = useContext(AuthContext);

  const [joinGame, { isLoading }] = useJoinGameMutation();

  const handleJoinGame = async () => {
    if (!gameId.trim()) {
      addNotification(`Game ID is missing.`, "warning");
      return;
    }
    const result = await joinGame({ gameId, playerId: userId });

    if (result?.data && result?.data?.game) {
      addNotification(
        result?.data?.message || `Joined game successfully!`,
        "success"
      );
      localStorage.setItem("currentGameId", result?.data?.game?._id);
      setTimeout(() => {
        navigate(`/game/${result?.data?.game?._id}`);
      }, 2000);
    } else {
      console.log("Error result:", result);
      addNotification(
        result?.error?.data?.message || `Failed to join game!`,
        "error"
      );
    }
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
        sx={{
          marginTop: "2rem",
          marginBottom: "1rem",
          color: "#ffffff",
          "& .MuiInputBase-root": {
            color: "#ffffff",
          },
          "& .MuiInputLabel-root": {
            color: "rgba(255, 255, 255, 0.7)",
          },
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.5)",
            },
            "&:hover fieldset": {
              borderColor: "#ffffff",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#ffffff",
            },
          },
        }}
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
    </Box>
  );
};

export default JoinGame;
