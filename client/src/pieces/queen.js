// src/pieces/queen.js
import Piece from "./piece.js";
import {
  isSameRow,
  isSameColumn,
  isSameDiagonal,
  isPathClean,
} from "../helpers";

export default class Queen extends Piece {
  constructor(player) {
    super(
      player,
      player === 1
        ? "https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg"
        : "https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg"
    );
    this.player = player;
    this.type = "Queen";
  }

  isMovePossible(src, dest, squares) {
    // Check if the move is along the same row, column, or diagonal
    if (
      !(
        isSameRow(src, dest) ||
        isSameColumn(src, dest) ||
        isSameDiagonal(src, dest)
      )
    ) {
      return false;
    }

    // Get the path between src and dest
    const path = this.getSrcToDestPath(src, dest);

    // Check if the path is clear
    return isPathClean(path, squares);
  }

  /**
   * Dynamically calculates the path between src and dest (exclusive)
   * @param {number} src - Source square index (0-63)
   * @param {number} dest - Destination square index (0-63)
   * @returns {number[]} - Array of square indices between src and dest
   */
  getSrcToDestPath(src, dest) {
    const path = [];
    const rowSrc = Math.floor(src / 8);
    const colSrc = src % 8;
    const rowDest = Math.floor(dest / 8);
    const colDest = dest % 8;

    const rowStep = rowDest > rowSrc ? 1 : rowDest < rowSrc ? -1 : 0;
    const colStep = colDest > colSrc ? 1 : colDest < colSrc ? -1 : 0;

    let current = src + rowStep * 8 + colStep;

    while (current !== dest) {
      path.push(current);
      current += rowStep * 8 + colStep;
    }

    return path;
  }
}
