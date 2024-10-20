// src/components/Game.js
import React, { useState, useEffect } from "react";
import { Box, Typography, Tooltip, IconButton } from "@mui/material";
import { Restore, Undo } from "@mui/icons-material";
import BoardComponent from "./BoardComponent";
import FallenSoldierBlock from "./FallenSoldierBlock";
import initialiseChessBoard from "../helpers/board-initialiser";
import King from "../pieces/king";
import { deserializeSquares } from "../helpers/deserializeSquares";
import { resetGame } from "../helpers/resetGame";
import ConfirmationDialog from "../helpers/ConfirmationDialog";

const VALID_PIECE_TYPES = ["King", "Queen", "Bishop", "Knight", "Rook", "Pawn"];

const Game = () => {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [history, setHistory] = useState([]);
  const [squares, setSquares] = useState(() => {
    const savedState = localStorage.getItem("chessGameState");
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        const deserialized = deserializeSquares(parsedState.squares);
        if (
          Array.isArray(deserialized) &&
          deserialized.length === 64 &&
          deserialized.every(
            (piece) => piece === null || VALID_PIECE_TYPES.includes(piece.type)
          )
        ) {
          return deserialized;
        } else {
          console.warn("Invalid deserialized squares. Initializing new board.");
        }
      } catch (error) {
        console.error("Error deserializing squares:", error);
      }
    }
    return initialiseChessBoard();
  });

  const [whiteFallenSoldiers, setWhiteFallenSoldiers] = useState(() => {
    const savedState = localStorage.getItem("chessGameState");
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      return parsedState.whiteFallenSoldiers || [];
    }
    return [];
  });

  const [blackFallenSoldiers, setBlackFallenSoldiers] = useState(() => {
    const savedState = localStorage.getItem("chessGameState");
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      return parsedState.blackFallenSoldiers || [];
    }
    return [];
  });

  const [player, setPlayer] = useState(() => {
    const savedState = localStorage.getItem("chessGameState");
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      return parsedState.player || 1;
    }
    return 1;
  });

  const [turn, setTurn] = useState(() => {
    const savedState = localStorage.getItem("chessGameState");
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      return parsedState.turn || "white";
    }
    return "white";
  });

  const [status, setStatus] = useState(() => {
    const savedState = localStorage.getItem("chessGameState");
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      return parsedState.status || "";
    }
    return "";
  });
  const [selectedSquare, setSelectedSquare] = useState(null);

  const handleClick = (i) => {
    setHistory((prevHistory) => [
      ...prevHistory,
      {
        squares: [...squares],
        whiteFallenSoldiers: [...whiteFallenSoldiers],
        blackFallenSoldiers: [...blackFallenSoldiers],
        player,
        turn,
        status,
        selectedSquare,
      },
    ]);

    const newSquares = [...squares];
    const clickedPiece = newSquares[i];

    if (selectedSquare === null) {
      if (!clickedPiece || clickedPiece.player !== player) {
        setStatus(`Wrong selection. Choose player ${player} pieces.`);
      } else {
        setSelectedSquare(i);
        setStatus("Choose destination for the selected piece");
      }
      return;
    }

    if (i === selectedSquare) {
      setSelectedSquare(null);
      setStatus("");
      return;
    }

    if (clickedPiece && clickedPiece.player === player) {
      setSelectedSquare(i);
      setStatus("Choose destination for the selected piece");
      return;
    }

    const sourcePiece = newSquares[selectedSquare];

    const isMovePossible = sourcePiece.isMovePossible(
      selectedSquare,
      i,
      squares
    );

    if (isMovePossible) {
      const whiteFallen = [];
      const blackFallen = [];

      if (newSquares[i]) {
        if (newSquares[i].player === 1) {
          whiteFallen.push(newSquares[i]);
        } else {
          blackFallen.push(newSquares[i]);
        }
      }

      newSquares[i] = sourcePiece;
      newSquares[selectedSquare] = null;

      const isCheckMe = isCheckForPlayer(newSquares, player);
      if (isCheckMe) {
        setStatus(
          "Wrong. Choose valid source/destination. Now you have a check!"
        );
        setSelectedSquare(null);
      } else {
        const nextPlayer = player === 1 ? 2 : 1;
        const nextTurn = turn === "white" ? "black" : "white";
        setSquares(newSquares);
        setWhiteFallenSoldiers([...whiteFallenSoldiers, ...whiteFallen]);
        setBlackFallenSoldiers([...blackFallenSoldiers, ...blackFallen]);
        setPlayer(nextPlayer);
        setTurn(nextTurn);
        setStatus("");
        setSelectedSquare(null);
      }
    } else {
      setStatus("Wrong selection. Choose valid source and destination again.");
      setSelectedSquare(null);
    }
  };

  const getKingPosition = (squares, player) => {
    return squares.findIndex(
      (piece) => piece && piece.getPlayer() === player && piece instanceof King
    );
  };

  const isCheckForPlayer = (squares, player) => {
    const opponent = player === 1 ? 2 : 1;
    const kingPos = getKingPosition(squares, player);
    if (kingPos === -1) return false;

    for (let idx = 0; idx < squares.length; idx++) {
      const piece = squares[idx];
      if (piece && piece.getPlayer() === opponent) {
        if (piece.isMovePossible(idx, kingPos, squares)) {
          return true;
        }
      }
    }

    return false;
  };

  const serializeSquares = (squares) => {
    return squares?.map((piece) => {
      if (!piece) return null;
      return {
        type: piece.type,
        player: piece.player,
      };
    });
  };

  const handleResetGame = () => {
    setOpenConfirm(true);
  };

  const handleConfirmReset = () => {
    resetGame({
      setSquares,
      setWhiteFallenSoldiers,
      setBlackFallenSoldiers,
      setPlayer,
      setTurn,
      setStatus,
      setSelectedSquare,
    });
    setHistory([]);
    setOpenConfirm(false);
  };

  const handleCancelReset = () => {
    setOpenConfirm(false);
  };

  const handleUndo = () => {
    if (history.length === 0) {
      setStatus("No moves to undo.");
      return;
    }

    const lastState = history[history.length - 1];

    setSquares(lastState.squares);
    setWhiteFallenSoldiers(lastState.whiteFallenSoldiers);
    setBlackFallenSoldiers(lastState.blackFallenSoldiers);
    setPlayer(lastState.player);
    setTurn(lastState.turn);
    setStatus(lastState.status);
    setSelectedSquare(lastState.selectedSquare);

    setHistory(history.slice(0, history.length - 1));
  };

  useEffect(() => {
    try {
      const serializedState = {
        squares: serializeSquares(squares),
        whiteFallenSoldiers,
        blackFallenSoldiers,
        player,
        turn,
        status,
      };
      localStorage.setItem("chessGameState", JSON.stringify(serializedState));
    } catch (error) {
      console.error("Failed to save chess game state:", error);
    }
  }, [squares, whiteFallenSoldiers, blackFallenSoldiers, player, turn, status]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "linear-gradient(0deg, #4b79a1 0%, #283e51 100%)",
        minHeight: "100vh",
        padding: 2,
        color: "#fff",
      }}
    >
      <Box
        sx={{
          margin: "0.5rem 1rem",
          display: "flex",
          width: "100%",
          gap: "0.5rem",
        }}
      >
        <Tooltip title="Undo Last Move" placement="left">
          <IconButton
            onClick={handleUndo}
            sx={{
              p: 1,
              background: "#20927B",
              "&:hover": {
                background: "#59C8B2",
              },
            }}
          >
            <Undo />
          </IconButton>
        </Tooltip>
        <Tooltip title="Restart The Game" placement="right">
          <IconButton
            onClick={handleResetGame}
            sx={{
              p: 1,
              background: "#B13333",
              "&:hover": {
                background: "#B47272",
              },
            }}
          >
            <Restore />
          </IconButton>
        </Tooltip>
      </Box>

      <Box
        sx={{
          width: "100%",
          maxWidth: "22.5rem",
          minHeight: "7rem",
          margin: "1rem 0",
        }}
      >
        <Typography variant="h5" mb={2}>
          Turn/Next: {turn.charAt(0).toUpperCase() + turn.slice(1)}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              backgroundColor: turn,
              border: "1px solid #000",
              margin: "0 1rem 0 0",
            }}
          ></Box>
          <Typography variant="body1" sx={{ fontSize: "0.85rem", m: 0, p: 0 }}>
            {status}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          height: "100%",
          maxWidth: "33rem",
          padding: 0,
          margin: 0,
        }}
      >
        <BoardComponent
          squares={squares}
          onClick={handleClick}
          selectedSquare={selectedSquare}
        />
      </Box>
      <Box sx={{ width: "100%", maxWidth: "20rem", marginTop: 4 }}>
        <FallenSoldierBlock
          whiteFallenSoldiers={whiteFallenSoldiers}
          blackFallenSoldiers={blackFallenSoldiers}
        />
      </Box>
      <ConfirmationDialog
        open={openConfirm}
        title="Restart Game"
        content="Are you sure you want to restart the game? All current progress will be lost."
        onConfirm={handleConfirmReset}
        onCancel={handleCancelReset}
        confirmText="Restart"
        cancelText="Cancel"
      />
    </Box>
  );
};

export default Game;
