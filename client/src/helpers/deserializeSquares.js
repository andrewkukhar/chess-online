// src/helpers/deserializeSquares.js
import King from "../pieces/king";
import Queen from "../pieces/queen";
import Rook from "../pieces/rook";
import Bishop from "../pieces/bishop";
import Knight from "../pieces/knight";
import Pawn from "../pieces/pawn";

export const deserializeSquares = (serializedSquares) => {
  return serializedSquares.map((pieceData) => {
    if (!pieceData) return null;
    const { type, player } = pieceData;
    switch (type) {
      case "King":
        return new King(player);
      case "Queen":
        return new Queen(player);
      case "Rook":
        return new Rook(player);
      case "Bishop":
        return new Bishop(player);
      case "Knight":
        return new Knight(player);
      case "Pawn":
        return new Pawn(player);
      default:
        return null;
    }
  });
};
