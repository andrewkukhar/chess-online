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
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  useEffect(() => {
    const verifyToken = () => {
      if (token) {
        try {
          if (isTokenExpired(token)) {
            handleLogout();
          } else {
            setIsTokenReady(true);
          }
        } catch (error) {
          handleLogout();
        }
      } else {
        setIsTokenReady(false);
      }
      setIsCheckingToken(false);
    };

    if (token) verifyToken();

    if (userId) localStorage.setItem("userId", userId);
    if (username) localStorage.setItem("username", username);
  }, [token, userId, username]);

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUserId(null);
    setUsername(null);
    setIsTokenReady(false);

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
    setIsTokenReady(true);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        userId,
        username,
        isTokenReady,
        isCheckingToken,
        handleLogin,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
