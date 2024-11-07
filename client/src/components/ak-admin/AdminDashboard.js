// src/components/Game/OnlineLanding.js
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useCheckAAdminRoleQuery } from "../../services/api-services/check";
import { CircularProgress, Typography, Tabs, Tab, Box } from "@mui/material";
import UsersTab from "./tabs/UsersTab";
import GamesTab from "./tabs/GamesTab";
import MovesTab from "./tabs/MovesTab";

const AdminDashboard = () => {
  const { data: isValidRole, isLoading, isError } = useCheckAAdminRoleQuery();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTab, setSelectedTab] = useState(
    parseInt(searchParams.get("tab")) || 0
  );
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setSearchParams({ tab: newValue });
  };

  if (isLoading) {
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

  if (isError || !isValidRole) {
    return <Typography variant="h6">Access Denied. Not Authorized.</Typography>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page-body">
        <Typography variant="h2" gutterBottom>
          Admin Dashboard
        </Typography>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label="Users" />
          <Tab label="Games" />
          <Tab label="Moves" />
        </Tabs>
        {selectedTab === 0 && <UsersTab />}
        {selectedTab === 1 && <GamesTab />}
        {selectedTab === 2 && <MovesTab />}
      </div>
    </div>
  );
};

export default AdminDashboard;
