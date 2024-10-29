// src/components/Game/OnlineLanding.js
import React from "react";
import { Box, Button, Typography, Tooltip } from "@mui/material";
import { Link } from "react-router-dom";

const OnlineLanding = () => {
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
      }}
    >
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
    </Box>
  );
};

export default OnlineLanding;
