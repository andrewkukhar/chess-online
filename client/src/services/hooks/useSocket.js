// client/src/services/hooks/useSocket.js
import { useEffect, useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";

const useSocket = () => {
  const { socket } = useContext(AuthContext);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket]);

  return { socket, connected };
};

export default useSocket;
