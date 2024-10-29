// src/components/Navbar.js
import React, { useContext, useState } from "react";
import { useGetAllGamesQuery } from "../services/api-services/game";
import {
  Button,
  Typography,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const Navbar = () => {
  const { token, username, isTokenReady, userId, handleLogout } =
    useContext(AuthContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  console.log("userId", userId);
  console.log("token", token);
  console.log("isTokenReady", isTokenReady);

  const {
    data: gamesData,
    isLoading,
    isError,
  } = useGetAllGamesQuery(undefined, {
    skip: !isTokenReady,
  });
  console.log("gamesData", gamesData);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const onLogout = () => {
    handleLogout();
    navigate("/login");
  };

  return (
    <div className="navbar">
      <div className="navbar-appbar">
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
            Chess Game
          </Link>
        </Typography>
        {!token ? (
          <>
            <Tooltip title="Login to play online game" placement="bottom">
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
            </Tooltip>
            <Tooltip
              title="Play game locally with someone standing with you"
              placement="bottom"
            >
              <Button color="inherit" component={Link} to="/localgame">
                Local
              </Button>
            </Tooltip>
          </>
        ) : (
          <>
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              aria-controls={open ? "user-games-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
            >
              {username}
            </IconButton>
            <Menu
              id="user-games-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              MenuListProps={{
                "aria-labelledby": "user-games-button",
              }}
            >
              <Typography variant="subtitle1" sx={{ padding: "0.5rem 1rem" }}>
                Your Games
              </Typography>
              {isLoading ? (
                <MenuItem>
                  <CircularProgress size={24} />
                </MenuItem>
              ) : isError ? (
                <MenuItem disabled>Error loading games</MenuItem>
              ) : gamesData && gamesData?.length > 0 ? (
                gamesData?.map((game) => (
                  <MenuItem
                    key={game?._id}
                    component={Link}
                    to={`/game/${game?._id}`}
                    onClick={handleMenuClose}
                  >
                    {game?.name || `Game ${game?._id}`}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No games found</MenuItem>
              )}
            </Menu>
            <Button color="inherit" onClick={onLogout}>
              Logout
            </Button>
            <Button color="inherit" component={Link} to="/online">
              Online
            </Button>
            <Button color="inherit" component={Link} to="/localgame">
              Local
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
