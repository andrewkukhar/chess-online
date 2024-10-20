// src/helpers/deserializeSquares.js

import Bishop from "../pieces/bishop.js";
import King from "../pieces/king.js";
import Knight from "../pieces/knight.js";
import Pawn from "../pieces/pawn.js";
import Queen from "../pieces/queen.js";
import Rook from "../pieces/rook.js";

/**
 * Deserializes the squares array from localStorage into piece instances.
 * @param {Array} serializedSquares - The serialized squares array.
 * @returns {Array} - The deserialized squares array with piece instances.
 */
export function deserializeSquares(serializedSquares) {
  if (!Array.isArray(serializedSquares) || serializedSquares.length !== 64) {
    console.warn("Serialized squares are invalid or incomplete.");
    return null;
  }

  return serializedSquares.map((square, index) => {
    if (!square) return null;

    const { type, player } = square;

    switch (type) {
      case "Bishop":
        return new Bishop(player);
      case "King":
        return new King(player);
      case "Knight":
        return new Knight(player);
      case "Pawn":
        return new Pawn(player);
      case "Queen":
        return new Queen(player);
      case "Rook":
        return new Rook(player);
      default:
        console.warn(`Unknown piece type "${type}" at square ${index}.`);
        return null;
    }
  });
}
