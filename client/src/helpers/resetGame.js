import initialiseChessBoard from "./board-initialiser";

export const resetGame = ({
  setSquares,
  setWhiteFallenSoldiers,
  setBlackFallenSoldiers,
  setPlayer,
  setTurn,
  setStatus,
  setSelectedSquare,
}) => {
  const initialSquares = initialiseChessBoard();

  const initialWhiteFallen = [];
  const initialBlackFallen = [];

  const initialPlayer = 1;
  const initialTurn = "white";

  const initialStatus = "";
  const initialSelectedSquare = null;

  setSquares(initialSquares);
  setWhiteFallenSoldiers(initialWhiteFallen);
  setBlackFallenSoldiers(initialBlackFallen);
  setPlayer(initialPlayer);
  setTurn(initialTurn);
  setStatus(initialStatus);
  setSelectedSquare(initialSelectedSquare);

  localStorage.removeItem("chessGameState");
};
