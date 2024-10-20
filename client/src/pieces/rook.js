// src/pieces/rook.js
import Piece from "./piece.js";
import { isSameRow, isSameColumn, isPathClean } from "../helpers";

export default class Rook extends Piece {
  constructor(player) {
    super(
      player,
      player === 1
        ? "https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg"
        : "https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg"
    );
  }

  isMovePossible(src, dest, squares) {
    if (!(isSameRow(src, dest) || isSameColumn(src, dest))) return false;
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
    const step = isSameRow(src, dest)
      ? dest > src
        ? 1
        : -1
      : dest > src
      ? 8
      : -8;

    let current = src + step;
    while (current !== dest) {
      path.push(current);
      current += step;
    }

    return path;
  }
}
