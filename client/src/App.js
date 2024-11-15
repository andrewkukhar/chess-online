// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NotificationProvider } from "./contexts/NotificationContext";
import AdminDashboard from "./components/ak-admin/AdminDashboard";
import CreateGame from "./components/games/CreateGame";
import JoinGame from "./components/games/JoinGame";
import LocalGame from "./components/games/LocalGame";
import OnlineGame from "./components/games/OnlineGame";
import Login from "./components/authentification/Login";
import Register from "./components/authentification/Register";
import Navbar from "./components/Navbar";
import OnlineLanding from "./components/OnlineLanding";
import ProtectedRoute from "./utils/ProtectedRoute";
import LoginViaToken from "./services/hooks/LoginViaToken";
import GameLanding from "./components/games/GameLanding";

import "./App.scss";

const App = () => {
  return (
    <NotificationProvider>
      <div className="app">
        <Router>
          <div className="app-navbar">
            <Navbar />
          </div>
          <div className="app-body">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/localgame" element={<LocalGame />} />
              <Route path="/login-via-token" element={<LoginViaToken />} />
              <Route
                path="/dashboard"
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
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<GameLanding />} />
            </Routes>
          </div>
        </Router>
      </div>
    </NotificationProvider>
  );
};

export default App;
