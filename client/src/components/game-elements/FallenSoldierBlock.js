// src/components/FallenSoldierBlock.js
import React from "react";
import { Grid, Avatar, Typography, Box } from "@mui/material";
import {
  whiteBishop,
  blackBishop,
  whiteKing,
  blackKing,
  whiteKnight,
  blackKnight,
  whitePawn,
  blackPawn,
  whiteQueen,
  blackQueen,
  whiteRook,
  blackRook,
} from "../../pieces/pieceImages";

const FallenSoldierBlock = ({ whiteFallenSoldiers, blackFallenSoldiers }) => {
  const pieceImages = {
    white_Pawn: whitePawn,
    white_Rook: whiteRook,
    white_Knight: whiteKnight,
    white_Bishop: whiteBishop,
    white_Queen: whiteQueen,
    white_King: whiteKing,
    black_Pawn: blackPawn,
    black_Rook: blackRook,
    black_Knight: blackKnight,
    black_Bishop: blackBishop,
    black_Queen: blackQueen,
    black_King: blackKing,
  };

  const renderFallenSoldier = (piece, index) => {
    const playerColor = piece?.player === 1 ? "white" : "black";
    const pieceType = piece?.type;
    const imageKey = `${playerColor}_${pieceType}`;
    const imageSrc = pieceImages[imageKey];

    return (
      <Avatar
        key={index}
        src={imageSrc}
        alt={`${playerColor} ${pieceType}`}
        sx={{
          width: 30,
          height: 30,
          margin: "2px",
        }}
      />
    );
  };

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
