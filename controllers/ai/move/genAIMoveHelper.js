function createBoardMatrix(board) {
  let matrix = "";
  for (let rank = 0; rank < 8; rank++) {
    let row = "";
    for (let file = 0; file < 8; file++) {
      const index = rank * 8 + file;
      const piece = board[index];
      if (piece === null) {
        row += ". ";
      } else {
        const pieceChar = getPieceChar(piece);
        row += pieceChar + " ";
      }
    }
    matrix += row.trim() + "\n";
  }
  return matrix.trim();
}

function getPieceChar(piece) {
  const charMap = {
    Pawn: "P",
    Rook: "R",
    Knight: "N",
    Bishop: "B",
    Queen: "Q",
    King: "K",
  };
  const char = charMap[piece.type];
  return piece.player === 1 ? char.toUpperCase() : char.toLowerCase();
}

function getAllLegalMoves(board, player) {
  const moves = [];
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
          const moveNotation = `${indexToAlgebraic(src)}${indexToAlgebraic(
            dest
          )} (${piece.type})`;
          moves.push(moveNotation);
        }
      }
    }
  }
  return moves;
}

module.exports = { createBoardMatrix, getPieceChar, getAllLegalMoves };
