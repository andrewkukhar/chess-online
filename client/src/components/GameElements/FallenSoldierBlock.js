// src/components/FallenSoldierBlock.js
import React from "react";
import { Grid, Avatar, Typography, Box } from "@mui/material";

const FallenSoldierBlock = ({ whiteFallenSoldiers, blackFallenSoldiers }) => {
  const renderFallenSoldier = (piece, index) => (
    <Avatar
      key={index}
      src={piece.style.backgroundImage.replace("url('", "").replace("')", "")}
      alt="Fallen Soldier"
      sx={{
        width: 30,
        height: 30,
        margin: "2px",
      }}
    />
  );

  return (
    <Box>
      <Typography variant="subtitle1">White Fallen Soldiers:</Typography>
      <Grid container>
        {whiteFallenSoldiers.map((ws, index) => renderFallenSoldier(ws, index))}
      </Grid>
      <Typography variant="subtitle1" sx={{ marginTop: 2 }}>
        Black Fallen Soldiers:
      </Typography>
      <Grid container>
        {blackFallenSoldiers?.map((bs, index) =>
          renderFallenSoldier(bs, index)
        )}
      </Grid>
    </Box>
  );
};

export default FallenSoldierBlock;
