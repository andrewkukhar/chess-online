const PIECE_TYPES = ["King", "Queen", "Bishop", "Knight", "Rook", "Pawn"];

/**
 * Initializes the chess board with the standard starting positions.
 * @returns {Array} - Array of 64 elements representing the board.
 */
function initialiseChessBoard() {
  const board = Array(64).fill(null);

  // Initialize black pieces
  board[0] = { type: "Rook", player: 2, style: "black" };
  board[1] = { type: "Knight", player: 2, style: "black" };
  board[2] = { type: "Bishop", player: 2, style: "black" };
  board[3] = { type: "Queen", player: 2, style: "black" };
  board[4] = { type: "King", player: 2, style: "black" };
  board[5] = { type: "Bishop", player: 2, style: "black" };
  board[6] = { type: "Knight", player: 2, style: "black" };
  board[7] = { type: "Rook", player: 2, style: "black" };
  for (let i = 8; i < 16; i++) {
    board[i] = { type: "Pawn", player: 2, style: "black" };
  }

  // Initialize white pieces
  board[56] = { type: "Rook", player: 1, style: "white" };
  board[57] = { type: "Knight", player: 1, style: "white" };
  board[58] = { type: "Bishop", player: 1, style: "white" };
  board[59] = { type: "Queen", player: 1, style: "white" };
  board[60] = { type: "King", player: 1, style: "white" };
  board[61] = { type: "Bishop", player: 1, style: "white" };
  board[62] = { type: "Knight", player: 1, style: "white" };
  board[63] = { type: "Rook", player: 1, style: "white" };
  for (let i = 48; i < 56; i++) {
    board[i] = { type: "Pawn", player: 1, style: "white" };
  }

  return board;
}

/**
 * Reconstructs the board state from the initial setup and move history.
 * @param {Array} moves - Array of move objects.
 * @returns {Array} - Current board state as an array of 64 elements.
 */
function reconstructBoard(moves) {
  const board = Array(64).fill(null);

  const initialBoard = initialiseChessBoard();
  for (let i = 0; i < 64; i++) {
    board[i] = initialBoard[i] ? { ...initialBoard[i] } : null;
  }

  moves.forEach((move, index) => {
    const { from, to, piece, captured } = move;

    if (from === undefined || to === undefined || !piece) {
      console.error(`Move at index ${index} is missing required fields:`, move);
      throw new Error(`Move at index ${index} is missing required fields.`);
    }

    if (!board[from]) {
      console.error(
        `Invalid move at index ${index}: No piece at square ${from}. Move:`,
        move
      );
      throw new Error(
        `Invalid move at index ${index}: No piece at square ${from}.`
      );
    }

    if (board[from].type !== piece) {
      console.error(
        `Invalid move at index ${index}: Piece type mismatch at square ${from}. Expected ${board[from].type}, got ${piece}. Move:`,
        move
      );
      throw new Error(
        `Invalid move at index ${index}: Piece type mismatch at square ${from}. Expected ${board[from].type}, got ${piece}.`
      );
    }

    board[to] = board[from];
    board[from] = null;
  });

  return board;
}

/**
 * Finds the position of the King for a given player.
 * @param {Array} board - Current board state.
 * @param {number} player - Player number (1 or 2).
 * @returns {number} - Index of the King, or -1 if not found.
 */
function findKingPosition(board, player) {
  return board.findIndex(
    (piece) => piece && piece.type === "King" && piece.player === player
  );
}

/**
 * Determines if the specified player's King is in check.
 * @param {Array} board - Current board state.
 * @param {number} player - Player number (1 or 2).
 * @returns {boolean} - True if King is in check, else false.
 */
function isKingInCheck(board, player) {
  const kingPos = findKingPosition(board, player);
  if (kingPos === -1) {
    throw new Error(`King not found for player ${player}.`);
  }

  const opponent = player === 1 ? 2 : 1;

  // Iterate over all opponent pieces to see if any can attack the King
  for (let i = 0; i < 64; i++) {
    const piece = board[i];
    if (piece && piece.player === opponent) {
      if (isMovePossibleInternal(i, kingPos, piece, board)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Determines if a move is possible for a given piece.
 * @param {number} src - Source square index (0-63).
 * @param {number} dest - Destination square index (0-63).
 * @param {Object} piece - Piece object.
 * @param {Array} board - Current board state.
 * @returns {boolean} - True if move is possible, else false.
 */
function isMovePossibleInternal(src, dest, piece, board) {
  const { type, player } = piece;
  const rowSrc = Math.floor(src / 8);
  const colSrc = src % 8;
  const rowDest = Math.floor(dest / 8);
  const colDest = dest % 8;
  const rowDiff = rowDest - rowSrc;
  const colDiff = colDest - colSrc;

  // Calculate absolute differences
  const absRowDiff = Math.abs(rowDiff);
  const absColDiff = Math.abs(colDiff);

  switch (type) {
    case "Pawn":
      return isPawnMovePossible(src, dest, player, rowDiff, colDiff, board);
    case "Knight":
      return isKnightMovePossible(absRowDiff, absColDiff);
    case "Bishop":
      return isBishopMovePossible(src, dest, rowDiff, colDiff, board);
    case "Rook":
      return isRookMovePossible(src, dest, rowDiff, colDiff, board);
    case "Queen":
      return (
        isBishopMovePossible(src, dest, rowDiff, colDiff, board) ||
        isRookMovePossible(src, dest, rowDiff, colDiff, board)
      );
    case "King":
      return isKingMovePossible(absRowDiff, absColDiff);
    default:
      return false;
  }
}

function isPawnMovePossible(src, dest, player, rowDiff, colDiff, board) {
  console.log(`Checking pawn move from ${src} to ${dest}, player: ${player}`);

  const rowSrc = Math.floor(src / 8);
  const direction = player === 1 ? -1 : 1;
  const startingRow = player === 1 ? 6 : 1;

  // Forward move
  if (colDiff === 0) {
    if (rowDiff === direction && board[dest] === null) {
      return true;
    }
    if (
      rowDiff === 2 * direction &&
      rowSrc === startingRow &&
      board[dest] === null &&
      board[src + direction * 8] === null
    ) {
      return true;
    }
  }

  if (Math.abs(colDiff) === 1 && rowDiff === direction) {
    console.log(
      `Pawn attempting capture from ${src} to ${dest}, player: ${player}`
    );
    if (board[dest] && board[dest].player !== player) {
      console.log(`Capture is possible at ${dest}`);
      return true;
    } else {
      console.log(`No opponent piece at ${dest} to capture`);
    }
  }

  return false;
}

function isKnightMovePossible(absRowDiff, absColDiff) {
  return (
    (absRowDiff === 2 && absColDiff === 1) ||
    (absRowDiff === 1 && absColDiff === 2)
  );
}

function isBishopMovePossible(src, dest, rowDiff, colDiff, board) {
  if (Math.abs(rowDiff) !== Math.abs(colDiff)) return false;

  const stepRow = rowDiff > 0 ? 1 : -1;
  const stepCol = colDiff > 0 ? 1 : -1;
  let current = src + stepRow * 8 + stepCol;

  while (current !== dest) {
    if (board[current] !== null) return false;
    current += stepRow * 8 + stepCol;
  }

  return true;
}

function isRookMovePossible(src, dest, rowDiff, colDiff, board) {
  if (rowDiff !== 0 && colDiff !== 0) return false;

  const stepRow = rowDiff === 0 ? 0 : rowDiff > 0 ? 1 : -1;
  const stepCol = colDiff === 0 ? 0 : colDiff > 0 ? 1 : -1;
  let current = src + stepRow * 8 + stepCol;

  while (current !== dest) {
    if (board[current] !== null) return false;
    current += stepRow * 8 + stepCol;
  }

  return board[dest] === null || board[dest].player !== board[src].player;
}

function isKingMovePossible(absRowDiff, absColDiff) {
  return absRowDiff <= 1 && absColDiff <= 1;
}

/**
 * Validates a proposed move.
 * @param {Array} board - Current board state.
 * @param {Object} move - Move object containing from, to, piece, captured.
 * @param {number} player - Player number (1 or 2).
 * @returns {boolean} - True if move is valid, else false.
 */
function validateMove(board, move, player) {
  const { from, to, piece } = move;
  const movingPiece = board[from];

  // Ensure there is a piece at the source
  if (!movingPiece) {
    return false;
  }

  // Ensure the piece belongs to the player
  if (movingPiece.player !== player) {
    return false;
  }

  // Ensure the move is possible according to piece rules
  if (!isMovePossibleInternal(from, to, movingPiece, board)) {
    return false;
  }

  // Make a temporary move on a cloned board to check for check
  const tempBoard = board.map((piece) => (piece ? { ...piece } : null));
  const capturedPiece = tempBoard[to];
  tempBoard[to] = tempBoard[from];
  tempBoard[from] = null;

  // Check if the player's King is in check after the move
  if (piece === "King" || isKingInCheck(tempBoard, player)) {
    if (isKingInCheck(tempBoard, player)) {
      return false;
    }
  }

  return true;
}

/**
 * Helper function to convert board index (0-63) to algebraic notation (a1-h8)
 * @param {number} index - Board index (0-63)
 * @returns {string} - Algebraic notation (e.g., 'e2')
 */
function indexToAlgebraic(index) {
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const rank = Math.floor(index / 8) + 1;
  const file = files[index % 8];
  return `${file}${rank}`;
}

/**
 * Checks if the player has any legal moves left.
 * @param {Array} board - Current board state.
 * @param {number} player - Player number (1 or 2).
 * @returns {boolean} - True if there are legal moves, else false.
 */
function hasAnyLegalMoves(board, player) {
  for (let src = 0; src < 64; src++) {
    const piece = board[src];
    if (piece && piece.player === player) {
      for (let dest = 0; dest < 64; dest++) {
        const proposedMove = {
          from: src,
          to: dest,
          piece: piece.type,
        };
        if (validateMove(board, proposedMove, player)) {
          return true;
        }
      }
    }
  }
  return false;
}

module.exports = {
  PIECE_TYPES,
  reconstructBoard,
  isMovePossibleInternal,
  isPawnMovePossible,
  isKnightMovePossible,
  isBishopMovePossible,
  isRookMovePossible,
  isKingMovePossible,
  validateMove,
  indexToAlgebraic,
  hasAnyLegalMoves,
  initialiseChessBoard,
  isKingInCheck,
};
