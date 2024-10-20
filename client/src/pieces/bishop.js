// src/pieces/bishop.js
import Piece from "./piece.js";
import { isSameDiagonal, isPathClean } from "../helpers";

export default class Bishop extends Piece {
  constructor(player) {
    super(
      player,
      player === 1
        ? "https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg"
        : "https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg"
    );
    this.player = player;
    this.type = "Bishop";
  }

  isMovePossible(src, dest, squares) {
    if (!isSameDiagonal(src, dest)) return false;
    const path = this.getSrcToDestPath(src, dest);
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

    const rowStep = rowDest > rowSrc ? 1 : -1;
    const colStep = colDest > colSrc ? 1 : -1;

    let current = src + rowStep * 8 + colStep;

    while (current !== dest) {
      path.push(current);
      current += rowStep * 8 + colStep;
    }

    return path;
  }
}
