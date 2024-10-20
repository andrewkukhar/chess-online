// src/pieces/pawn.js
import Piece from "./piece.js";

export default class Pawn extends Piece {
  constructor(player) {
    super(
      player,
      player === 1
        ? "https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg"
        : "https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg"
    );
    this.initialPositions = {
      1: [48, 49, 50, 51, 52, 53, 54, 55],
      2: [8, 9, 10, 11, 12, 13, 14, 15],
    };
    this.player = player;
    this.type = "Pawn";
  }

  isMovePossible(src, dest, squares) {
    const rowSrc = Math.floor(src / 8);
    const rowDest = Math.floor(dest / 8);
    const colSrc = src % 8;
    const colDest = dest % 8;
    const rowDiff = this.player === 1 ? rowSrc - rowDest : rowDest - rowSrc;
    const colDiff = Math.abs(colDest - colSrc);

    // Forward move
    if (colDiff === 0) {
      if (rowDiff === 1 && squares[dest] === null) {
        return true;
      }
      if (
        rowDiff === 2 &&
        squares[dest] === null &&
        squares[this.player === 1 ? src - 8 : src + 8] === null &&
        this.initialPositions[this.player].includes(src)
      ) {
        return true;
      }
    }

    // Diagonal capture
    if (colDiff === 1) {
      if (
        (this.player === 1 &&
          rowDiff === 1 &&
          squares[dest] &&
          squares[dest].player === 2) ||
        (this.player === 2 &&
          rowDiff === 1 &&
          squares[dest] &&
          squares[dest].player === 1)
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Returns the path between src and dest (exclusive)
   * Only applicable for initial two-square moves
   * @param {number} src - Source square index (0-63)
   * @param {number} dest - Destination square index (0-63)
   * @returns {number[]} - Array containing the square index between src and dest
   */
  getSrcToDestPath(src, dest) {
    if (Math.abs(dest - src) === 16) {
      const intermediate = this.player === 1 ? src - 8 : src + 8;
      return [intermediate];
    }
    return [];
  }
}
