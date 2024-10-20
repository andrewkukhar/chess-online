// src/pieces/king.js
import Piece from "./piece.js";

export default class King extends Piece {
  constructor(player) {
    super(
      player,
      player === 1
        ? "https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg"
        : "https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg"
    );
  }

  isMovePossible(src, dest, squares) {
    const rowSrc = Math.floor(src / 8);
    const colSrc = src % 8;
    const rowDest = Math.floor(dest / 8);
    const colDest = dest % 8;

    const rowDiff = Math.abs(rowDest - rowSrc);
    const colDiff = Math.abs(colDest - colSrc);

    // King moves one square in any direction
    if (rowDiff <= 1 && colDiff <= 1) {
      return true;
    }

    return false;
  }

  /**
   * The King moves only one square, so the path is always clear
   * @returns {number[]} - Always returns an empty array
   */
  getSrcToDestPath(src, dest) {
    return [];
  }
}
