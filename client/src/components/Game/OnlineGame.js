// src/components/OnlineGame.js
import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import {
  useMakeMoveMutation,
  useUndoMoveMutation,
} from "../../services/api-services/move";
import { useGetAllMovesQuery } from "../../services/api-services/move";
import { useGetGameQuery } from "../../services/api-services/game";
import {
  Box,
  Typography,
  Tooltip,
  IconButton,
  Snackbar,
  Alert,
  Button,
} from "@mui/material";
import { Restore, Undo } from "@mui/icons-material";
import { AuthContext } from "../../contexts/AuthContext";
import { useSocket } from "../../contexts/SocketContext";
import BoardComponent from "../GameElements/BoardComponent";
import FallenSoldierBlock from "../GameElements/FallenSoldierBlock";
import initialiseChessBoard from "../../helpers/board-initialiser";
import { resetGame } from "../../helpers/resetGame";
import ConfirmationDialog from "../../helpers/ConfirmationDialog";

const OnlineGame = () => {
  const { gameId: paramGameId } = useParams();
  const { socket } = useSocket();
  const { userId } = useContext(AuthContext);

  const [gameId, setGameId] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [playerColor, setPlayerColor] = useState(null);

  const [selectedSquare, setSelectedSquare] = useState(null);

  const [snackbarAlert, setSnackbarAlert] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const [openConfirm, setOpenConfirm] = useState(false);

  // RTK Query Hooks
  const { data: gameData } = useGetGameQuery(gameId, {
    skip: !gameId,
  });
  const { data: movesData, refetch: refetchMoves } = useGetAllMovesQuery(
    gameId,
    {
      skip: !gameId,
    }
  );
  const [makeMove] = useMakeMoveMutation();
  const [undoMove] = useUndoMoveMutation();

  // Local State
  const [squares, setSquares] = useState(() => initialiseChessBoard());
  const [whiteFallenSoldiers, setWhiteFallenSoldiers] = useState([]);
  const [blackFallenSoldiers, setBlackFallenSoldiers] = useState([]);
  const [playerTurn, setPlayerTurn] = useState("white");

  useEffect(() => {
    if (paramGameId) {
      setGameId(paramGameId);
      localStorage.setItem("currentGameId", paramGameId);
    } else {
      const storedGameId = localStorage.getItem("currentGameId");
      if (storedGameId) {
        setGameId(storedGameId);
      }
    }
  }, [paramGameId]);

  useEffect(() => {
    if (gameData && gameData.players) {
      const playerIndex = gameData.players.findIndex(
        (player) => player._id === userId
      );
      const color = playerIndex === 0 ? "white" : "black";
      setPlayerColor(color);
      setIsHost(playerIndex === 0);
      setPlayerTurn(gameData.moves.length % 2 === 0 ? "white" : "black");
    }
  }, [gameData, userId]);

  useEffect(() => {
    if (movesData && movesData.moves) {
      const initialBoard = initialiseChessBoard();
      const fallenWhite = [];
      const fallenBlack = [];

      movesData.moves.forEach((move) => {
        // eslint-disable-next-line
        const { from, to, piece, captured } = move;

        initialBoard[to] = initialBoard[from];
        initialBoard[from] = null;

        if (captured) {
          const capturedPiece = captured.toLowerCase(); // Assuming 'piece' indicates the type
          const fallenPiece = {
            type:
              capturedPiece.charAt(0).toUpperCase() + capturedPiece.slice(1),
            style: initialBoard[to].style, // Adjust as needed
          };
          if (initialBoard[to].player === 1) {
            fallenBlack.push(fallenPiece);
          } else {
            fallenWhite.push(fallenPiece);
          }
        }
      });

      setSquares(initialBoard);
      setWhiteFallenSoldiers(fallenWhite);
      setBlackFallenSoldiers(fallenBlack);
    }
  }, [movesData]);

  useEffect(() => {
    if (!socket || !gameId) return;

    const handleNewMove = (data) => {
      if (data.gameId === gameId) {
        setSnackbarAlert({
          open: true,
          message: "A new move has been made.",
          severity: "info",
        });
        refetchMoves();
      }
    };

    const handleMoveUndone = (data) => {
      if (data.gameId === gameId) {
        setSnackbarAlert({
          open: true,
          message: "A move has been undone.",
          severity: "info",
        });

        refetchMoves();
      }
    };

    socket.on("newMove", handleNewMove);
    socket.on("moveUndone", handleMoveUndone);

    return () => {
      socket.off("newMove", handleNewMove);
      socket.off("moveUndone", handleMoveUndone);
    };
  }, [socket, gameId, refetchMoves]);

  const handleResetGame = () => {
    setOpenConfirm(true);
  };

  const handleConfirmReset = () => {
    resetGame({
      setSquares,
      setWhiteFallenSoldiers,
      setBlackFallenSoldiers,
      setPlayer: () => {}, // Update as per your resetGame implementation
      setTurn: () => {},
      setStatus: () => {},
      setSelectedSquare,
    });
    setOpenConfirm(false);
    setSnackbarAlert({
      open: true,
      message: "Game has been reset.",
      severity: "info",
    });
    // Emit a socket event to notify the server about the reset, if necessary
    socket.emit("resetGame", { gameId });
  };

  const handleCancelReset = () => {
    setOpenConfirm(false);
  };

  const handleMove = async (from, to, piece, captured) => {
    if (!playerColor) {
      setSnackbarAlert({
        open: true,
        message: "Player color not determined.",
        severity: "error",
      });
      return;
    }
    const result = await makeMove({
      gameId,
      move: { from, to, piece: piece?.type, captured },
    });

    if (result?.data && result?.data?.game) {
      setSnackbarAlert({
        open: true,
        message: result?.data?.message || `Move has been made!`,
        severity: "success",
      });
      // localStorage.setItem("currentGameId", result?.data?.game?._id);
    } else {
      console.log("Error result:", result);
      setSnackbarAlert({
        open: true,
        message: result?.error?.data?.message || `Failed to make move.`,
        severity: "error",
      });
    }
  };

  const handleUndo = async () => {
    if (!socket) {
      setSnackbarAlert({
        open: true,
        message: "Socket not connected. Please try again later.",
        severity: "error",
      });
      return;
    }
    const result = await undoMove({ gameId });

    if (result?.data && result?.data?.game) {
      setSnackbarAlert({
        open: true,
        message: result?.data?.message || `Move has been undone!`,
        severity: "success",
      });
      // localStorage.setItem("currentGameId", result?.data?.game?._id);
    } else {
      console.log("Error result:", result);
      setSnackbarAlert({
        open: true,
        message: result?.error?.data?.message || `Failed to undo move.`,
        severity: "error",
      });
    }
  };

  const handleSquareClick = (i) => {
    if (playerTurn !== playerColor) {
      setSnackbarAlert({
        open: true,
        message: "It's not your turn.",
        severity: "info",
      });
      return;
    }

    const clickedPiece = squares[i];

    if (selectedSquare === null) {
      if (!clickedPiece || clickedPiece.player !== (isHost ? 1 : 2)) {
        setSnackbarAlert({
          open: true,
          message: "Select your own piece.",
          severity: "error",
        });
      } else {
        setSelectedSquare(i);
      }
      return;
    }

    if (i === selectedSquare) {
      setSelectedSquare(null);
      return;
    }

    const sourcePiece = squares[selectedSquare];

    const isMovePossible = sourcePiece.isMovePossible(
      selectedSquare,
      i,
      squares
    );

    if (isMovePossible) {
      const capturedPiece = squares[i];
      handleMove(selectedSquare, i, sourcePiece, capturedPiece);
      setSelectedSquare(null);
    } else {
      setSelectedSquare(null);
      setSnackbarAlert({
        open: true,
        message: "Invalid move. Please try again.",
        severity: "error",
      });
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarAlert({ open: false, message: "", severity: "info" });
  };

  return (
    <div className="game">
      <Box
        sx={{
          margin: "0.5rem 1rem",
          padding: "0.25rem 2rem",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          gap: "0.5rem",
        }}
      >
        <Typography variant="h7" mr={2}>
          Online Game Room - {gameId}
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => {
            navigator.clipboard.writeText(`${gameId}`);
            setSnackbarAlert({
              open: true,
              message: "Game link copied to clipboard.",
              severity: "success",
            });
          }}
          disabled={!gameId}
        >
          Copy Game Link
        </Button>
        <Box
          sx={{
            margin: "0.5rem",
            padding: "0.25rem",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
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
              disabled={playerTurn !== playerColor}
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
      </Box>
      <Box
        sx={{
          width: "100%",
          margin: "0.5rem 0",
          padding: "0.5rem 0",
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <Typography variant="h5">
          {`Next: ${playerTurn.charAt(0).toUpperCase() + playerTurn.slice(1)}`}
        </Typography>
        <Box
          sx={{
            width: 32,
            height: 32,
            backgroundColor: playerTurn,
            border: "1px solid #000",
            margin: "0.5rem 0.75rem",
            padding: "0",
            textAlign: "center",
          }}
        ></Box>
      </Box>
      <BoardComponent
        squares={squares}
        onClick={handleSquareClick}
        selectedSquare={selectedSquare}
      />
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
      <Snackbar
        open={snackbarAlert.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarAlert.severity}
          sx={{ width: "100%" }}
        >
          {snackbarAlert.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default OnlineGame;
