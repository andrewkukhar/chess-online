// src/helpers/board-initialiser.js

import Bishop from "../pieces/bishop.js";
import King from "../pieces/king.js";
import Knight from "../pieces/knight.js";
import Pawn from "../pieces/pawn.js";
import Queen from "../pieces/queen.js";
import Rook from "../pieces/rook.js";

export default function initialiseChessBoard() {
  const squares = Array(64).fill(null);

  // Initialize black pieces
  squares[0] = new Rook(2);
  squares[1] = new Knight(2);
  squares[2] = new Bishop(2);
  squares[3] = new Queen(2);
  squares[4] = new King(2);
  squares[5] = new Bishop(2);
  squares[6] = new Knight(2);
  squares[7] = new Rook(2);
  for (let i = 8; i < 16; i++) {
    squares[i] = new Pawn(2);
  }

  // Initialize white pieces
  squares[56] = new Rook(1);
  squares[57] = new Knight(1);
  squares[58] = new Bishop(1);
  squares[59] = new Queen(1);
  squares[60] = new King(1);
  squares[61] = new Bishop(1);
  squares[62] = new Knight(1);
  squares[63] = new Rook(1);
  for (let i = 48; i < 56; i++) {
    squares[i] = new Pawn(1);
  }

  return squares;
}
