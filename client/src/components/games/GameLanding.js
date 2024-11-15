// src/components/Game/GameLanding.js
import React, { useContext } from "react";
import { Box, Button, Typography, Tooltip } from "@mui/material";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

const GameLanding = () => {
  const { isTokenReady, token } = useContext(AuthContext);

  return (
    <div className="game-landing-page">
      <Box
        sx={{
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Welcome to Chess Game
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Play online against other players, challenge the AI, or play a local
          game.
        </Typography>
      </Box>
      <Box
        sx={{
          width: "100%",
          maxWidth: "30rem",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: "1.5rem",
          mt: 2,
        }}
      >
        {!token && (
          <>
            <Tooltip
              title="Login to your account to play online"
              placement="top"
            >
              <Button
                variant="contained"
                color="primary"
                component={Link}
                to="/login"
                className="game-landing-btn game-landing-btn-log"
              >
                Login
              </Button>
            </Tooltip>
            <Tooltip
              title="Create a new account to start playing"
              placement="top"
            >
              <Button
                variant="contained"
                color="primary"
                component={Link}
                to="/register"
                className="game-landing-btn game-landing-btn-reg"
              >
                Register
              </Button>
            </Tooltip>
          </>
        )}
        <Tooltip
          title="Play a local game with someone next to you"
          placement="bottom"
        >
          <Button
            variant="contained"
            color="secondary"
            component={Link}
            to="/localgame"
            className="game-landing-btn game-landing-btn-lg"
          >
            Play Locally
          </Button>
        </Tooltip>
        {isTokenReady && token && (
          <Tooltip title="Go to your player dashboard" placement="top">
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/dashboard"
              className="game-landing-btn game-landing-btn-dash"
            >
              Dashboard
            </Button>
          </Tooltip>
        )}
      </Box>
      <Box className="game-landing-page-notes" mt={4}>
        <Typography variant="h6">About the Game</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Enjoy a game of chess with friends, AI opponents, or other players
          online. Whether you're an experienced player or just starting out, our
          platform offers a variety of ways to play.
        </Typography>
      </Box>
      <Box className="game-landing-page-notes">
        <Typography variant="h6" gutterBottom>
          Note About Development
        </Typography>
        <Typography variant="body2">
          This game is in the early stages of development and is still being
          tested. The AI is currently training and will improve over time, but
          for now, it might not be very challenging. Some advanced moves, such
          as castling and pawn promotion, are not available yet. The AI uses an
          OpenAI model ("gpt-4o-mini") and is continuously learning. If you have
          any feedback or suggestions, we'd love to hear from you!
        </Typography>
        <Typography variant="h6" mt={2}>
          Upcoming Features:
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          We are working on adding more exciting features like chat with your
          opponent during games, spectators for public matches, and many more!
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          <strong>Support:</strong> Soon, we will also add a dedicated support
          system and an email service for submitting bugs and issues. Stay
          tuned!
        </Typography>
        <Typography variant="h7" sx={{ mt: 1 }}>
          Contact us at:{" "}
          <a href="mailto:akukharv@gmail.com" className="email">
            akukharv@gmail.com
          </a>
        </Typography>
      </Box>
    </div>
  );
};

export default GameLanding;
