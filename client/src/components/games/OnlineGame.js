// src/components/OnlineGame.js
import React, { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useMakeMoveMutation,
  useGetAllMovesQuery,
} from "../../services/api-services/move";
import {
  useGetGameQuery,
  useResetGameMutation,
  useSwitchPlayerRolesMutation,
  useUpdatePlayerGameRoomStatusMutation,
  useJoinGameRoomMutation,
} from "../../services/api-services/game";
import { useMakeAIMoveMutation } from "../../services/api-services/game-ai";
import {
  Box,
  Typography,
  Tooltip,
  IconButton,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  Restore,
  HourglassEmpty,
  HourglassTop,
  HourglassBottom,
} from "@mui/icons-material";
import { AuthContext } from "../../contexts/AuthContext";
import { useSocket } from "../../contexts/SocketContext";
import { NotificationContext } from "../../contexts/NotificationContext";
import BoardComponent from "../game-elements/BoardComponent";
import FallenSoldierBlock from "../game-elements/FallenSoldierBlock";
import initialiseChessBoard from "../../helpers/board-initialiser";
import { resetGame } from "../../helpers/resetGame";
import ConfirmationDialog from "../../helpers/ConfirmationDialog";
import InvitatioDialog from "./InvitationDialog";
import PlayerStatusBadge from "../../helpers/PlayerStatusBadge";

const OnlineGame = () => {
  const { gameId: paramGameId } = useParams();
  const navigate = useNavigate();
  console.log("paramGameId:", paramGameId);

  const { socket } = useSocket();
  const { userId } = useContext(AuthContext);

  const [gameId, setGameId] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [playerColor, setPlayerColor] = useState(null);
  const [winnerName, setWinnerName] = useState(null);

  const [selectedSquare, setSelectedSquare] = useState(null);
  const { addNotification, clearNotifications } =
    useContext(NotificationContext);

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
  const [makeAIMove] = useMakeAIMoveMutation();
  const [resetGameApi] = useResetGameMutation();
  const [switchPlayerRoles] = useSwitchPlayerRolesMutation();
  const [updatePlayerGameRoomStatus] = useUpdatePlayerGameRoomStatusMutation();
  const [joinGameRoom] = useJoinGameRoomMutation();

  const [squares, setSquares] = useState(() => initialiseChessBoard());
  const [whiteFallenSoldiers, setWhiteFallenSoldiers] = useState([]);
  const [blackFallenSoldiers, setBlackFallenSoldiers] = useState([]);
  const [playerTurn, setPlayerTurn] = useState("white");
  const [lastMove, setLastMove] = useState({ from: null, to: null });
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [isWaitingForAI, setIsWaitingForAI] = useState(false);

  const handleNewMove = useCallback(
    (data) => {
      if (data.gameId === gameId) {
        addNotification("A new move has been made.", "info", 1000);
        setPlayerTurn(data.playerTurn);
        setLastMove({ from: data.moveFrom, to: data.moveTo });
        refetchMoves();
        refetchGameData();
      }
    },
    [
      gameId,
      addNotification,
      setPlayerTurn,
      setLastMove,
      refetchMoves,
      refetchGameData,
    ]
  );

  useEffect(() => {
    if (gameId) {
      refetchGameData();
      refetchMoves();
    }
  }, [gameId, refetchGameData, refetchMoves]);

  useEffect(() => {
    if (paramGameId) {
      setGameId(paramGameId);
      localStorage.setItem("currentGameId", paramGameId);

      joinGameRoom({ gameId: paramGameId })
        .unwrap()
        .then(() => {
          console.log("Player joined game room successfully");
        })
        .catch((error) => {
          console.error("Error joining game room:", error);
        });
    } else {
      const storedGameId = localStorage.getItem("currentGameId");

      if (storedGameId) {
        setGameId(storedGameId);
      } else {
        navigate("/dashboard");
      }
    }
  }, [paramGameId, navigate, joinGameRoom]);

  useEffect(() => {
    return () => {
      if (gameId) {
        updatePlayerGameRoomStatus({ gameId })
          .unwrap()
          .then(() => {
            console.log("Player status updated successfully");
          })
          .catch((error) => {
            console.error("Error updating player status:", error);
          });
      }
    };
  }, [gameId, updatePlayerGameRoomStatus]);

  useEffect(() => {
    if (gameData && gameData.players) {
      // console.log("Game Data:", gameData);
      // console.log("Number of Moves:", gameData.moves.length);
      const playerIndex = gameData.players.findIndex(
        (p) => p?.player?._id === userId
      );
      const color = playerIndex === 0 ? "white" : "black";
      setPlayerColor(color);
      setIsHost(playerIndex === 0);
    }
  }, [gameData, userId]);

  useEffect(() => {
    if (gameData) {
      if (gameData.nextTurn) {
        setPlayerTurn(gameData.nextTurn);
      } else if (gameData.moves) {
        const totalMoves = gameData.moves.length;
        const nextPlayerTurn = totalMoves % 2 === 0 ? "white" : "black";
        setPlayerTurn(nextPlayerTurn);
      }

      if (gameData.winner) {
        setWinnerName(gameData.winner.username || "Unknown");
      } else {
        setWinnerName(null);
      }
    }
  }, [gameData]);

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

          if (captured.player === 1) {
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
    if (!socket) {
      console.log("Socket not connected yet.");
      return;
    }
    if (!gameId) {
      console.log("Game ID not set yet.");
      return;
    }
    const handleGameOverEvent = (data) => {
      if (data.gameId === gameId) {
        addNotification(data.message, "success");
        refetchGameData?.();
      }
    };
    const handleCheckEvent = (data) => {
      if (data.gameId === gameId) {
        addNotification(
          data.message || `Check! The ${data.kingColor} king is under threat.`,
          "warning",
          2500
        );
      }
    };
    const handleResetGameEvent = (data) => {
      if (data.oldGameId === gameId) {
        console.log("handleResetGameEvent data", data);
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
    const handlePlayerRolesSwitched = (data) => {
      if (data.gameId === gameId) {
        addNotification(`Player roles have been switched.`, "info");
        refetchGameData?.();
      }
    };
    const handlePlayerJoinedGame = (data) => {
      if (data.gameId === gameId) {
        addNotification(data.message || `New player joined game.`, "info");
        refetchGameData?.();
      }
    };
    const handlePlayerGameRoomStatusUpdated = (data) => {
      if (data.gameId === gameId) {
        if (data.playerId !== userId) {
          addNotification(
            `${data.username} has ${
              data.isOnlineInGameRoom ? "joined" : "left"
            } the game room.`,
            "info",
            1500
          );
          refetchGameData?.();
        }
      }
    };

    socket.off("newMove", handleNewMove);
    socket.off("gameOver", handleGameOverEvent);
    socket.off("checkToKing", handleCheckEvent);

    socket.on("newMove", handleNewMove);
    socket.on("gameOver", handleGameOverEvent);
    socket.on("checkToKing", handleCheckEvent);
    socket.on("gameReset", handleResetGameEvent);
    socket.on("playerRolesSwitched", handlePlayerRolesSwitched);
    socket.on("playerJoinedGame", handlePlayerJoinedGame);
    socket.on("playerGameRoomStatusUpdated", handlePlayerGameRoomStatusUpdated);

    return () => {
      socket.off("newMove", handleNewMove);
      socket.off("gameOver", handleGameOverEvent);
      socket.off("checkToKing", handleCheckEvent);
      socket.off("gameReset", handleResetGameEvent);
      socket.off("playerRolesSwitched", handlePlayerRolesSwitched);
      socket.off("playerJoinedGame", handlePlayerJoinedGame);
      socket.off(
        "playerGameRoomStatusUpdated",
        handlePlayerGameRoomStatusUpdated
      );

      clearNotifications();
    };
  }, [
    socket,
    gameId,
    userId,
    handleNewMove,
    navigate,
    refetchMoves,
    refetchGameData,
    addNotification,
    clearNotifications,
  ]);
  // console.log("gameData", gameData);

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
    console.log("handleMove from:", from);
    console.log("handleMove to:", to);
    console.log("handleMove piece:", piece);
    console.log("handleMove captured:", captured);
    if (!gameId) {
      addNotification(`Game ID are missing.`, "error");
      return;
    }
    if (!playerColor || isWaitingForAI) {
      addNotification(`Player color not determined.`, "error");
      return;
    }
    if (
      from === null ||
      from === undefined ||
      to === null ||
      to === undefined ||
      !piece?.type
    ) {
      console.log("Move data are missing if block:", from, to, piece, captured);

      addNotification(`Move data are missing.`, "error");
      return;
    }

    const result = await makeMove({
      gameId,
      move: { from, to, piece: piece?.type, captured },
    });

    if (result?.data && result?.data?.move) {
      setLastMove({ from, to });

      if (result.data.checkmate) {
        // Game is over; do not call makeAIMove
        addNotification("Checkmate! You have won the game.", "success");
        setWinnerName(getPlayerNameByColor(playerColor));
      } else if (
        playerTurn === "white" &&
        gameData?.players?.some((p) => p?.isAI)
      ) {
        setIsWaitingForAI(true);

        makeAIMove({ gameId })
          .unwrap()
          .then((aiResult) => {
            refetchMoves?.();
            setPlayerTurn(aiResult?.playerTurn);

            if (aiResult?.checkmate) {
              addNotification("Checkmate! The AI has won the game.", "info");
              setWinnerName("AI");
            }
          })
          .finally(() => {
            setIsWaitingForAI(false);
          });
      }
    } else {
      console.log("Error result:", result);
      addNotification(
        result?.error?.data?.message || `Failed to make move!`,
        "error"
      );
    }
  };

  const handleSquareClick = (i) => {
    if (gameData?.status === "checkmate" || gameData?.winner) {
      addNotification(
        `The game is over. ${gameData?.winner?.username} won.`,
        "info",
        4500
      );
      return;
    }

    if (gameData.players.some((p) => p.isAI && playerTurn === "black")) {
      addNotification(`It's the AI's turn. Please wait...`, "info", 1500);
      return;
    }

    if (playerTurn !== playerColor) {
      addNotification(`It's not your turn.`, "info", 1500);
      return;
    }

    const clickedPiece = squares[i];
    // console.log("clickedPiece", clickedPiece);
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
      // console.log("capturedPiece", capturedPiece);
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
    !gameData?.players?.some((p) => p?.isAI) &&
    gameData?.players?.length === 2 &&
    gameData?.moves?.length === 0;

  const shouldShowGameInviteOptions =
    gameData &&
    !gameData?.players?.some((p) => p?.isAI) &&
    gameData?.players?.length === 1 &&
    gameData?.moves?.length === 0;

  const getPlayerNameByColor = (color) => {
    if (!gameData || !gameData.players) return "";
    const playerIndex = color === "white" ? 0 : 1;
    return gameData.players[playerIndex]?.player?.username || color;
  };

  const handleInviteClick = () => {
    setInviteDialogOpen(true);
  };

  const handleCloseInviteDialog = () => {
    setInviteDialogOpen(false);
  };

  const isPlayerOnline = (playerId) => {
    if (!playerId) {
      return false;
    }
    const playerData = gameData?.players.find((p) => p.player._id === playerId);
    return playerData && playerData.isOnlineInGameRoom;
  };

  const HourglassAnimation = () => {
    const [currentIcon, setCurrentIcon] = useState(0);
    const icons = [
      <HourglassEmpty sx={{ fontSize: "2rem", color: "white" }} />,
      <HourglassTop sx={{ fontSize: "2rem", color: "white" }} />,
      <HourglassBottom sx={{ fontSize: "2rem", color: "white" }} />,
    ];

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentIcon((prev) => (prev + 1) % icons.length);
      }, 750); // Change icon every 500 milliseconds

      return () => clearInterval(interval); // eslint-disable-next-line
    }, []);

    return icons[currentIcon];
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
  console.log("socket:", socket);
  console.log("gameId:", gameId);
  console.log("paramGameId:", paramGameId);
  console.log("userId:", userId);
  console.log("gameData:", gameData);

  return (
    <div className="game">
      <div className="game-header">
        <Box className="game-header-title">
          <Typography variant="h7" mr={2}>
            Online Game Room - {gameData?.name || gameId}
          </Typography>
          {shouldShowGameInviteOptions && (
            <>
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
                disabled={!gameId || gameData?.players?.some((p) => p?.isAI)}
              >
                Invite by Email
              </Button>
            </>
          )}
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
        <Box className="game-header-players-info">
          <Typography variant="h6">Players: </Typography>
          <div className="game-header-players-info-box">
            <div className="game-header-players-info-box-item">
              <PlayerStatusBadge
                isOnline={isPlayerOnline(gameData?.players?.[0]?.player?._id)}
                playerInitial={
                  gameData?.players?.[0]?.player?.username
                    ?.charAt(0)
                    .toUpperCase() || "P"
                }
              />
              {gameData?.players?.[0]?.player?.username || "Player 1"}
            </div>
            VS{" "}
            <div className="game-header-players-info-box-item">
              {gameData?.players?.some((p) => p?.isAI) ? (
                <>
                  AI Bot
                  {isWaitingForAI && (
                    <div className="game-header-players-info-box-item-wating-box">
                      <HourglassAnimation />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <PlayerStatusBadge
                    isOnline={isPlayerOnline(
                      gameData?.players?.[1]?.player?._id
                    )}
                    playerInitial={
                      gameData?.players?.[1]?.player?.username
                        ?.charAt(0)
                        .toUpperCase() || "P"
                    }
                  />
                  {gameData?.players?.[1]?.player?.username || "Player 2"}
                </>
              )}
            </div>
          </div>
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
          onClick={!isWaitingForAI ? handleSquareClick : null}
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
