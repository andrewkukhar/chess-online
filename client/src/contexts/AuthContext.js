// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import { isTokenExpired } from "../utils/tokenUtils";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [userId, setUserId] = useState(() => localStorage.getItem("userId"));

  const [username, setUsername] = useState(() =>
    localStorage.getItem("username")
  );

  const [isTokenReady, setIsTokenReady] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      setIsTokenReady(true);
    } else {
      setIsTokenReady(false);
    }
    if (userId) localStorage.setItem("userId", userId);
    if (username) localStorage.setItem("username", username);
  }, [token, userId, username]);

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUserId(null);
    setUsername(null);

    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("currentGameId");
  };

  useEffect(() => {
    if (token && isTokenExpired(token)) {
      handleLogout();
    }
  }, [token]);

  const handleLogin = (data) => {
    const { token, userId, username } = data;
    setToken(token);
    setUserId(userId);
    setUsername(username);

    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("username", username);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        userId,
        username,
        isTokenReady,
        handleLogin,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
