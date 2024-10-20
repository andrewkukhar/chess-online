// src/helpers/index.js

/**
 * Checks if two squares are on the same row.
 * @param {number} src - Source square index (0-63)
 * @param {number} dest - Destination square index (0-63)
 * @returns {boolean}
 */
const isSameRow = (src, dest) => {
  return Math.floor(src / 8) === Math.floor(dest / 8);
};

/**
 * Checks if two squares are on the same column.
 * @param {number} src - Source square index (0-63)
 * @param {number} dest - Destination square index (0-63)
 * @returns {boolean}
 */
const isSameColumn = (src, dest) => {
  return src % 8 === dest % 8;
};

/**
 * Checks if two squares are on the same diagonal.
 * @param {number} src - Source square index (0-63)
 * @param {number} dest - Destination square index (0-63)
 * @returns {boolean}
 */
const isSameDiagonal = (src, dest) => {
  const rowDiff = Math.abs(Math.floor(src / 8) - Math.floor(dest / 8));
  const colDiff = Math.abs((src % 8) - (dest % 8));
  return rowDiff === colDiff;
};

/**
 * Checks if all squares in the path are unoccupied.
 * @param {number[]} srcToDestPath - Array of square indices between src and dest (exclusive)
 * @param {Array} squares - Current state of the board
 * @returns {boolean}
 */
const isPathClean = (srcToDestPath, squares) => {
  return srcToDestPath.every((square) => squares[square] === null);
};

export { isSameRow, isSameColumn, isSameDiagonal, isPathClean };
