// src/components/CreateGame.js
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationContext } from "../../contexts/NotificationContext";
import { useCreateGameMutation } from "../../services/api-services/game";
import {
  Button,
  Box,
  Typography,
  CircularProgress,
  TextField,
} from "@mui/material";

const CreateGame = () => {
  const navigate = useNavigate();
  const { addNotification } = useContext(NotificationContext);
  const [gameName, setGameName] = useState("");
  const [createGame, { isLoading }] = useCreateGameMutation();

  const handleCreateNewGame = async () => {
    if (!gameName.trim()) {
      addNotification(`Please enter a valid game name!`, "warning");
      return;
    }
    const result = await createGame(gameName);

    if (result?.data && result?.data?.game) {
      addNotification(
        result?.data?.message || `Game created successfully!`,
        "success"
      );

      localStorage.setItem("currentGameId", result?.data?.game?._id);
      setTimeout(() => {
        navigate(`/game/${result?.data?.game?._id}`);
      }, 2000);
    } else {
      console.log("Error result:", result);
      addNotification(
        result?.error?.data?.message || `Failed to create game!`,
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
    </Box>
  );
};

export default CreateGame;
