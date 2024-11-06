// src/components/Navbar.js
import React, { useContext, useState } from "react";
import { useCheckAAdminRoleQuery } from "../services/api-services/check";
import {
  Button,
  Typography,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  Drawer,
  Divider,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import HomeIcon from "@mui/icons-material/Home";
import PublicIcon from "@mui/icons-material/Public";
import MobileOffIcon from "@mui/icons-material/MobileOff";
import LoginIcon from "@mui/icons-material/Login";
import SettingsIcon from "@mui/icons-material/Settings";
import UserSettingsDrawer from "./users/UserSettingsDrawer";

const Navbar = () => {
  const { token, username, userrole, isTokenReady, userId, handleLogout } =
    useContext(AuthContext);
  const isAdmin = userrole?.includes("admin");
  const { data: isValidRole } = useCheckAAdminRoleQuery(userId, {
    skip: !isTokenReady || !userId || !token || !isAdmin,
  });
  // console.log("NAVBAR isValidRole", isValidRole);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isSmallScreen = useMediaQuery("(max-width:600px)");

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

  const handleDrawerOpen = () => {
    setAnchorEl(null);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const iconStyle = { fontSize: "2.5rem", width: "2.5rem" };
  const iconButtonStyle = {
    fontSize: "3.5rem",
    width: "3.5rem",
    height: "2rem",
  };
  const buttonStyle = {
    fontSize: "3.5rem",
    width: "2.5rem",
    minWidth: "2.5rem",
  };

  return (
    <div className="navbar">
      <div className="navbar-appbar">
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontSize: "1.5rem",
            textAlign: "start",
            width: "100%",
          }}
        >
          <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
            {isSmallScreen ? <HomeIcon sx={iconStyle} /> : "Chess Game"}
          </Link>
        </Typography>
        {!token ? (
          <div className="navbar-appbar-body">
            <Tooltip title="Login to play online game" placement="bottom">
              <Button
                color="inherit"
                component={Link}
                to="/login"
                startIcon={
                  isSmallScreen ? <LoginIcon sx={iconButtonStyle} /> : null
                }
              >
                {isSmallScreen ? null : "Login"}
              </Button>
            </Tooltip>
            <Tooltip
              title="Play game locally with someone standing with you"
              placement="bottom"
            >
              <Button
                color="inherit"
                component={Link}
                to="/localgame"
                startIcon={
                  isSmallScreen ? <MobileOffIcon sx={iconButtonStyle} /> : null
                }
              >
                {isSmallScreen ? null : "Local"}
              </Button>
            </Tooltip>
          </div>
        ) : (
          <div className="navbar-appbar-body">
            {isValidRole && (
              <Tooltip title="Admin Dashboard" placement="bottom">
                <Button
                  color="inherit"
                  component={Link}
                  to="/admin-dashboard"
                  sx={isSmallScreen ? buttonStyle : null}
                  startIcon={
                    isSmallScreen ? <SettingsIcon sx={iconButtonStyle} /> : null
                  }
                >
                  {isSmallScreen ? null : "AD"}
                </Button>
              </Tooltip>
            )}
            <Tooltip title={`${username} menu`}>
              <IconButton
                color="inherit"
                onClick={handleMenuOpen}
                aria-controls={open ? "user-games-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
              >
                {isSmallScreen ? (
                  <AccountCircleIcon sx={iconStyle} />
                ) : (
                  username
                )}
              </IconButton>
            </Tooltip>
            <Menu
              id="user-games-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              MenuListProps={{
                "aria-labelledby": "user-games-button",
              }}
              PaperProps={{
                sx: { width: "25rem" },
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ padding: "0.5rem 1rem", textAlign: "center" }}
              >
                Account Settings
              </Typography>
              <Divider />
              <MenuItem
                component={Button}
                onClick={handleDrawerOpen}
                sx={{ width: "100%" }}
              >
                Settings
              </MenuItem>
            </Menu>
            <Drawer
              anchor="bottom"
              open={drawerOpen}
              onClose={handleDrawerClose}
              PaperProps={{
                sx: {
                  height: "calc(100% - 4.5rem)",
                  width: "100%",
                  p: 0,
                  m: 0,
                },
              }}
            >
              <UserSettingsDrawer handleClose={handleDrawerClose} />
            </Drawer>
            <Tooltip title="Logout" placement="bottom">
              <IconButton
                color="inherit"
                onClick={onLogout}
                sx={{ fontSize: "1rem" }}
              >
                {isSmallScreen ? <LogoutIcon sx={iconStyle} /> : "LOGOUT"}
              </IconButton>
            </Tooltip>
            <Tooltip title="Play online game" placement="bottom">
              <Button
                color="inherit"
                component={Link}
                to="/online"
                sx={isSmallScreen ? buttonStyle : null}
                startIcon={
                  isSmallScreen ? <PublicIcon sx={iconButtonStyle} /> : null
                }
              >
                {isSmallScreen ? null : "Online"}
              </Button>
            </Tooltip>
            <Tooltip title="Play game locally" placement="bottom">
              <Button
                color="inherit"
                component={Link}
                to="/localgame"
                sx={isSmallScreen ? buttonStyle : null}
                startIcon={
                  isSmallScreen ? <MobileOffIcon sx={iconButtonStyle} /> : null
                }
              >
                {isSmallScreen ? null : "Local"}
              </Button>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
