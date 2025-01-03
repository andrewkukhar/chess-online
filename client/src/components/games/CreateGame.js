// src/components/CreateGame.js
import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { NotificationContext } from "../../contexts/NotificationContext";
import { useCreateGameMutation } from "../../services/api-services/game";
import { useCreateGameAgainstAIMutation } from "../../services/api-services/game-ai";
import {
  Button,
  Box,
  Typography,
  CircularProgress,
  TextField,
  Select,
  MenuItem,
} from "@mui/material";

const CreateGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useContext(NotificationContext);
  const [gameName, setGameName] = useState("");
  const [againstAI, setAgainstAI] = useState(false);
  const [difficultyLevel, setDifficultyLevel] = useState("easy");

  const [createGame, { isLoading }] = useCreateGameMutation();
  const [createGameAgainstAI, { isLoading: isCreatingAIGame }] =
    useCreateGameAgainstAIMutation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("ai") === "true") {
      setAgainstAI(true);
    }
  }, [location]);

  // console.log("againstAI", againstAI);
  const handleCreateNewGame = async () => {
    if (!gameName.trim()) {
      addNotification(`Please enter a valid game name!`, "warning");
      return;
    }
    if (againstAI) {
      const result = await createGameAgainstAI({
        name: gameName,
        difficultyLevel,
      });
      if (result?.data && result?.data?.game) {
        addNotification(
          result?.data?.message || `Game against AI created successfully!`,
          "success"
        );
        localStorage.setItem("currentGameId", result?.data?.game?._id);
        setTimeout(() => {
          navigate(`/game/${result?.data?.game?._id}`);
        }, 1000);
      } else {
        console.log("Error result:", result);
        addNotification(
          result?.error?.data?.message || `Failed to create game against AI!`,
          "error"
        );
      }
    } else {
      const result = await createGame(gameName);
      if (result?.data && result?.data?.game) {
        addNotification(
          result?.data?.message || `Game created successfully!`,
          "success"
        );
        localStorage.setItem("currentGameId", result?.data?.game?._id);
        setTimeout(() => {
          navigate(`/game/${result?.data?.game?._id}`);
        }, 1000);
      } else {
        console.log("Error result:", result);
        addNotification(
          result?.error?.data?.message || `Failed to create game!`,
          "error"
        );
      }
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
      {againstAI && (
        <Select
          value={difficultyLevel}
          onChange={(e) => setDifficultyLevel(e.target.value)}
          fullWidth
          variant="outlined"
          sx={{
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
        >
          <MenuItem value="easy">Easy</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="hard">Hard</MenuItem>
        </Select>
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateNewGame}
        disabled={isLoading || isCreatingAIGame || !gameName.trim()}
        sx={{ marginTop: "2rem", width: "100%", padding: "0.75rem" }}
      >
        {isLoading || isCreatingAIGame ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          "Create Game"
        )}
      </Button>
    </Box>
  );
};

export default CreateGame;
