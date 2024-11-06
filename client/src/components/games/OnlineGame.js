// src/components/OnlineGame.js
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useMakeMoveMutation,
  useGetAllMovesQuery,
} from "../../services/api-services/move";
import {
  useGetGameQuery,
  useResetGameMutation,
  useSwitchPlayerRolesMutation,
} from "../../services/api-services/game";
import {
  Box,
  Typography,
  Tooltip,
  IconButton,
  Button,
  CircularProgress,
} from "@mui/material";
import { Restore } from "@mui/icons-material";
import { AuthContext } from "../../contexts/AuthContext";
import { useSocket } from "../../contexts/SocketContext";
import { NotificationContext } from "../../contexts/NotificationContext";
import BoardComponent from "../game-elements/BoardComponent";
import FallenSoldierBlock from "../game-elements/FallenSoldierBlock";
import initialiseChessBoard from "../../helpers/board-initialiser";
import { resetGame } from "../../helpers/resetGame";
import ConfirmationDialog from "../../helpers/ConfirmationDialog";
import InvitatioDialog from "./InvitationDialog";

const OnlineGame = () => {
  const { gameId: paramGameId } = useParams();
  const navigate = useNavigate();

  const { socket } = useSocket();
  const { userId } = useContext(AuthContext);

  const [gameId, setGameId] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [playerColor, setPlayerColor] = useState(null);
  const [winnerName, setWinnerName] = useState(null);

  const [selectedSquare, setSelectedSquare] = useState(null);
  const { addNotification } = useContext(NotificationContext);

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: null,
  });

  const {
    data: gameData,
    isLoading: gameLoading,
    refetch: refetchGameData,
  } = useGetGameQuery(gameId, {
    skip: !gameId,
  });
  // console.log("gameData", gameData);
  const {
    data: movesData,
    refetch: refetchMoves,
    isLoading: movesLoading,
  } = useGetAllMovesQuery(gameId, {
    skip: !gameId,
  });
  const [makeMove] = useMakeMoveMutation();
  const [resetGameApi] = useResetGameMutation();
  const [switchPlayerRoles] = useSwitchPlayerRolesMutation();

  const [squares, setSquares] = useState(() => initialiseChessBoard());
  const [whiteFallenSoldiers, setWhiteFallenSoldiers] = useState([]);
  const [blackFallenSoldiers, setBlackFallenSoldiers] = useState([]);
  const [playerTurn, setPlayerTurn] = useState("white");
  const [lastMove, setLastMove] = useState({ from: null, to: null });
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  useEffect(() => {
    if (paramGameId) {
      setGameId(paramGameId);
      localStorage.setItem("currentGameId", paramGameId);
    } else {
      const storedGameId = localStorage.getItem("currentGameId");

      if (storedGameId) {
        setGameId(storedGameId);
      } else {
        navigate("/online");
      }
    }
  }, [paramGameId, navigate]);

  useEffect(() => {
    if (gameData && gameData.players) {
      // console.log("Game Data:", gameData);
      // console.log("Number of Moves:", gameData.moves.length);
      const playerIndex = gameData.players.findIndex(
        (player) => player._id === userId
      );
      const color = playerIndex === 0 ? "white" : "black";
      setPlayerColor(color);
      setIsHost(playerIndex === 0);
      const turn = gameData.moves.length % 2 === 0 ? "white" : "black";
      // console.log("Next Player Turn:", turn);
      setPlayerTurn(turn);
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
          const { player, style, initialPositions, type } = captured;

          const fallenPiece = {
            player,
            style,
            initialPositions,
            type: type.charAt(0).toUpperCase() + type.slice(1),
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

      if (gameData?.lastMove) {
        setLastMove(gameData.lastMove);
      }
    }
  }, [movesData, gameData]);

  useEffect(() => {
    if (!socket || !gameId) return;

    const handleNewMove = (data) => {
      if (data.gameId === gameId) {
        addNotification("A new move has been made.", "info", 1000);
        setPlayerTurn(data.playerTurn);
        setLastMove({ from: data.moveFrom, to: data.moveTo });
        refetchMoves?.();
        refetchGameData?.();
      }
    };
    socket.on("newMove", handleNewMove);

    const handleGameOverEvent = (data) => {
      if (data.gameId === gameId) {
        addNotification(data.message, "success");
        refetchGameData?.();
      }
    };
    socket.on("gameOver", handleGameOverEvent);

    const handleCheckEvent = (data) => {
      if (data.gameId === gameId) {
        addNotification(
          data.message || `Check! The ${data.kingColor} king is under threat.`,
          "warning",
          3500
        );
      }
    };
    socket.on("checkToKing", handleCheckEvent);

    const handleResetGameEvent = (data) => {
      if (data.oldGameId === gameId) {
        addNotification(
          data.message ||
            `The ongoing game has been reset. A new game has begun.`,
          "info"
        );

        setGameId(data.newGameId);
        setWinnerName(null);

        resetGame({
          setSquares,
          setWhiteFallenSoldiers,
          setBlackFallenSoldiers,
          setPlayer: () => {},
          setTurn: () => {},
          setStatus: () => {},
          setSelectedSquare,
        });

        navigate(`/game/${data.newGameId}`);
      }
    };
    socket.on("gameReset", handleResetGameEvent);

    const handlePlayerRolesSwitched = (data) => {
      if (data.gameId === gameId) {
        addNotification(`Player roles have been switched.`, "info");
        refetchGameData?.();
      }
    };
    socket.on("playerRolesSwitched", handlePlayerRolesSwitched);

    const handlePlayerJoinedGame = (data) => {
      if (data.gameId === gameId) {
        addNotification(data.message || `New player joined game.`, "info");
        refetchGameData?.();
      }
    };
    socket.on("playerJoinedGame", handlePlayerJoinedGame);

    return () => {
      socket.off("newMove", handleNewMove);
      socket.off("gameOver", handleGameOverEvent);
      socket.off("checkToKing", handleCheckEvent);
      socket.off("gameReset", handleResetGameEvent);
      socket.off("playerRolesSwitched", handlePlayerRolesSwitched);
      socket.off("playerJoinedGame", handlePlayerJoinedGame);
    };
  }, [
    socket,
    gameId,
    userId,
    navigate,
    refetchMoves,
    refetchGameData,
    addNotification,
  ]);

  const handleConfirmReset = async () => {
    const result = await resetGameApi({ gameId });
    if (result?.data) {
      // addNotification(
      //   result?.data?.message || `Game has been reset successfully.`,
      //   "info"
      // );
      setConfirmDialog({ open: false, action: null });
    } else {
      console.log("Error result:", result);
      addNotification(
        result?.error?.data?.message || `Failed to reset game!`,
        "error"
      );
    }
  };

  const handleMove = async (from, to, piece, captured) => {
    if (!playerColor) {
      addNotification(`Player color not determined.`, "error");
      return;
    }
    const result = await makeMove({
      gameId,
      move: { from, to, piece: piece?.type, captured },
    });

    if (result?.data && result?.data?.move) {
      setLastMove({ from, to });
    } else {
      console.log("Error result:", result);
      addNotification(
        result?.error?.data?.message || `Failed to make move!`,
        "error"
      );
    }
  };

  const handleSquareClick = (i) => {
    if (gameData?.winner) {
      addNotification(
        `The game is over. ${gameData?.winner?.username} won.`,
        "info",
        4500
      );
      return;
    }

    if (playerTurn !== playerColor) {
      addNotification(`It's not your turn.`, "info", 1500);
      return;
    }

    const clickedPiece = squares[i];

    if (selectedSquare === null) {
      if (clickedPiece && clickedPiece.player === (isHost ? 1 : 2)) {
        setSelectedSquare(i);
      }
      return;
    }

    if (clickedPiece && clickedPiece.player === (isHost ? 1 : 2)) {
      setSelectedSquare(i);
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
      const capturedData = capturedPiece
        ? {
            player: capturedPiece.player,
            style: capturedPiece.style,
            initialPositions: capturedPiece.initialPositions,
            type: capturedPiece.type,
          }
        : null;
      // console.log("capturedData", capturedData);

      handleMove(selectedSquare, i, sourcePiece, capturedData);
      setSelectedSquare(null);
    } else {
      setSelectedSquare(null);
      addNotification(`Invalid move. Please try again.`, "error", 1000);
    }
  };

  const handleSwitchRoles = async () => {
    if (!gameId) {
      addNotification(`Game ID is required.`, "error");
      return;
    }

    const result = await switchPlayerRoles({ gameId });
    if (result) {
      setConfirmDialog({ open: false, gameId: null });
      // addNotification(
      //   result?.data?.message || "Player roles switched successfully.",
      //   "success"
      // );
      refetchGameData?.();
    } else {
      addNotification(
        result?.error?.data?.message || "Failed to switch player roles.",
        "error"
      );
    }
  };

  const handleConfirmDialogAction = async () => {
    if (confirmDialog.action === "resetGame") {
      await handleConfirmReset();
    } else if (confirmDialog.action === "switchRoles") {
      await handleSwitchRoles();
    }
  };

  const shouldShowSwitchOption =
    gameData &&
    gameData?.players?.length === 2 &&
    gameData?.moves?.length === 0;

  const getPlayerNameByColor = (color) => {
    if (!gameData || !gameData.players) return "";
    const playerIndex = color === "white" ? 0 : 1;
    return gameData.players[playerIndex]?.username || color;
  };

  const handleInviteClick = () => {
    setInviteDialogOpen(true);
  };

  const handleCloseInviteDialog = () => {
    setInviteDialogOpen(false);
  };

  if (gameLoading || movesLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="game">
      <div className="game-header">
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
            Online Game Room - {gameData?.name || gameId}
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              navigator.clipboard.writeText(`${gameId}`);
              addNotification(`Game link copied to clipboard.`, "success");
            }}
            disabled={!gameId}
          >
            Copy Game Link
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleInviteClick}
            disabled={!gameId}
          >
            Invite by Email
          </Button>
          {shouldShowSwitchOption && (
            <Button
              variant="outlined"
              color="info"
              onClick={() =>
                setConfirmDialog({ open: true, action: "switchRoles" })
              }
            >
              Switch Roles
            </Button>
          )}
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
            <Tooltip title="Restart The Game" placement="right">
              <IconButton
                onClick={() =>
                  setConfirmDialog({ open: true, action: "resetGame" })
                }
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
        <Box>
          <Typography variant="h6" mt={1}>
            Players: {gameData?.players?.[0]?.username || "Player 1"} vs{" "}
            {gameData?.players?.[1]?.username || "Player 2"}
          </Typography>
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
            ...(winnerName && {
              className: "winner-highlight",
            }),
          }}
        >
          {gameData?.winner ? (
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "#ff2600",
              }}
            >
              {`Checkmate! ${
                gameData?.winner?.username || "The winner"
              } has won the game!`}
            </Typography>
          ) : (
            <>
              <Typography variant="h6">
                {`Next: ${getPlayerNameByColor(playerTurn)}`}
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
            </>
          )}
        </Box>
      </div>
      <div className="board">
        <BoardComponent
          squares={squares}
          onClick={handleSquareClick}
          selectedSquare={selectedSquare}
          lastMove={lastMove}
        />
      </div>
      <div className="fallen-soldiers">
        <FallenSoldierBlock
          whiteFallenSoldiers={whiteFallenSoldiers}
          blackFallenSoldiers={blackFallenSoldiers}
        />
      </div>
      <ConfirmationDialog
        open={confirmDialog.open}
        title={
          confirmDialog.action === "resetGame"
            ? "Restart Game"
            : "Switch Player Roles"
        }
        content={
          confirmDialog.action === "resetGame"
            ? "Are you sure you want to restart the game? The new game will be started"
            : "Are you sure you want to switch player roles? This can only be done before the first move."
        }
        onConfirm={handleConfirmDialogAction}
        onCancel={() => setConfirmDialog({ open: false, action: null })}
        confirmText={
          confirmDialog.action === "resetGame" ? "Restart" : "Switch Roles"
        }
        cancelText="Cancel"
      />
      <InvitatioDialog
        open={inviteDialogOpen}
        onClose={handleCloseInviteDialog}
        gameId={gameId}
      />
    </div>
  );
};

export default OnlineGame;
