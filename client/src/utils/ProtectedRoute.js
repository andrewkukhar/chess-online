// client/src/utils/ProtectedRoute.js
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { token, isTokenReady } = useContext(AuthContext);
  // console.log("token", token);
  // console.log("isTokenReady", isTokenReady);
  if (!token || !isTokenReady) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
