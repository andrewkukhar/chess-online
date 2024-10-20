// src/components/Board.js
import React from "react";
import { Grid } from "@mui/material";
import Square from "./Square";

const Board = ({ squares, onClick, selectedSquare }) => {
  const renderSquare = (i, shade) => {
    const isSelected = i === selectedSquare;
    return (
      <Square
        key={i}
        keyVal={i}
        style={squares[i] ? squares[i].style : null}
        shade={shade}
        onClick={() => onClick(i)}
        isSelected={isSelected}
      />
    );
  };

  const boardRows = [];
  for (let row = 0; row < 8; row++) {
    const squaresInRow = [];
    for (let col = 0; col < 8; col++) {
      const index = row * 8 + col;
      const isLight = (row + col) % 2 === 0;
      const shade = isLight ? "light-square" : "dark-square";
      squaresInRow.push(renderSquare(index, shade));
    }
    boardRows.push(
      <Grid container key={row} spacing={0}>
        {squaresInRow}
      </Grid>
    );
  }

  return (
    <Grid
      container
      direction="column"
      sx={{
        border: "1px solid #000",
        width: "32.15rem",
        height: "30rem",
        padding: 0,
        margin: 0,
        "@media (max-width:600px)": {
          maxWidth: "22.5rem",
          maxHeight: "20rem",
        },
      }}
    >
      {boardRows}
    </Grid>
  );
};

export default Board;
