import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { AuthContext } from "./AuthContext";
import { useDispatch } from "react-redux";
import { gameApi } from "../services/api-services/game";
import { moveApi } from "../services/api-services/move";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { userId, token } = useContext(AuthContext);
  const dispatch = useDispatch();

  useEffect(() => {
    if (token && userId) {
      const newSocket = io(process.env.REACT_APP_BACKEND_URL, {
        query: { userId },
        autoConnect: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 5000,
      });

      setSocket(newSocket);

      newSocket.on("connect", () => console.log("WebSocket Connected"));
      newSocket.on("disconnect", () => console.log("WebSocket Disconnected"));
      newSocket.on("reconnect_attempt", (attempt) =>
        console.log(`Reconnect attempt ${attempt}`)
      );
      newSocket.on("reconnect_failed", () =>
        console.log("Reconnection failed")
      ); // Optionally notify the user or take other actions
      newSocket.on("gameCreated", (data) => {
        console.log("gameCreated event received:", data);
        dispatch(gameApi.util.invalidateTags(["Game"]));
      });
      newSocket.on("newGame", (data) => {
        console.log("newGame event received", data);
        dispatch(gameApi.util.invalidateTags(["Game"]));
      });
      newSocket.on("gameStatusUpdated", (data) => {
        console.log("gameStatusUpdated event received", data);
        dispatch(gameApi.util.invalidateTags(["Game"]));
      });
      newSocket.on("playerJoinedGame", (data) => {
        console.log("playerJoinedGame event received", data);
        dispatch(gameApi.util.invalidateTags(["Game"]));
      });
      newSocket.on("playerLeftGame", (data) => {
        console.log("playerLeftGame event received", data);
        dispatch(gameApi.util.invalidateTags(["Game"]));
      });
      newSocket.on("gameRemoved", (data) => {
        console.log("gameRemoved event received", data);
        dispatch(gameApi.util.invalidateTags(["Game"]));
      });
      newSocket.on("newMove", (data) => {
        console.log("newMove event received", data);
        dispatch(moveApi.util.invalidateTags(["Move"]));
      });
      newSocket.on("moveUndone", (data) => {
        console.log("moveUndone event received", data);
        dispatch(moveApi.util.invalidateTags(["Move"]));
      });
      newSocket.on("gameReset", (data) => {
        console.log("gameReset event received", data);
        dispatch(gameApi.util.invalidateTags(["Game"]));
      });

      return () => newSocket.close();
    }
  }, [userId, token, dispatch]);

  return (
    <SocketContext.Provider
      value={{
        socket,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
