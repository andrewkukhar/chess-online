// client/src/utils/ProtectedRoute.js
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

const ProtectedRoute = ({ children }) => {
  const { token, isTokenReady, isCheckingToken } = useContext(AuthContext);
  // console.log("token", token);
  // console.log("isTokenReady", isTokenReady);
  if (isCheckingToken) {
    // Display a loading spinner while checking authentication
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

  if (!token || !isTokenReady) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
