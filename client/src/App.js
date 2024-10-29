// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import CreateGame from "./components/Game/CreateGame";
import JoinGame from "./components/Game/JoinGame";
import LocalGame from "./components/Game/LocalGame";
import OnlineGame from "./components/Game/OnlineGame";
import Login from "./components/Authentifications/Login";
import Register from "./components/Authentifications/Register";
import Navbar from "./components/Navbar";
import OnlineLanding from "./components/OnlineLanding";
import ProtectedRoute from "./utils/ProtectedRoute";
import "./App.scss";

const App = () => {
  return (
    <div className="app">
      <Router>
        <div className="app-navbar" style={{ width: "100%" }}>
          <Navbar />
        </div>
        <div className="app-body">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/localgame" element={<LocalGame />} />
            <Route
              path="/online"
              element={
                <ProtectedRoute>
                  <OnlineLanding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreateGame />
                </ProtectedRoute>
              }
            />
            <Route
              path="/join"
              element={
                <ProtectedRoute>
                  <JoinGame />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game/:gameId"
              element={
                <ProtectedRoute>
                  <OnlineGame />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/localgame" replace />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
};

export default App;
