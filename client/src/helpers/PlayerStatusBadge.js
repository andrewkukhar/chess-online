import React from "react";
import Badge from "@mui/material/Badge";
import { styled } from "@mui/material/styles";
import { Avatar } from "@mui/material";

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: 8,
    top: 28,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: "4px 5px",
  },
}));

const PlayerStatusBadge = ({ isOnline, playerInitial }) => {
  return (
    <StyledBadge
      color="success"
      overlap="circular"
      variant="dot"
      invisible={!isOnline}
      sx={{ mr: 1 }}
    >
      <Avatar sx={{ width: 32, height: 32, mr: 0 }}>{playerInitial}</Avatar>
    </StyledBadge>
  );
};

export default PlayerStatusBadge;
