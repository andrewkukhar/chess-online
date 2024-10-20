// src/pieces/knight.js
import Piece from "./piece.js";

export default class Knight extends Piece {
  constructor(player) {
    super(
      player,
      player === 1
        ? "https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg"
        : "https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg"
    );
    this.player = player;
    this.type = "Knight";
  }

  isMovePossible(src, dest, squares) {
    const rowSrc = Math.floor(src / 8);
    const colSrc = src % 8;
    const rowDest = Math.floor(dest / 8);
    const colDest = dest % 8;

    const rowDiff = Math.abs(rowDest - rowSrc);
    const colDiff = Math.abs(colDest - colSrc);

    // L-shaped moves: 2 in one direction and 1 in the perpendicular direction
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
  }

  /**
   * Knights can jump over pieces, so the path is always clear
   * @returns {number[]} - Always returns an empty array
   */
  getSrcToDestPath(src, dest) {
    return [];
  }
}
