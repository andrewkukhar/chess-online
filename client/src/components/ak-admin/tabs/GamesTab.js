// src/components/ak-admin/tabs/GamesTab.js
import React from "react";
import { useGetAllGamesQuery } from "../../../services/api-services/game";
import { CircularProgress, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const GamesTab = () => {
  const { data: games, isLoading } = useGetAllGamesQuery();

  if (isLoading) {
    return <CircularProgress />;
  }

  // Map `_id` to `id`
  const rows =
    games?.map((game) => ({
      ...game,
      id: game?._id,
    })) || [];

  const columns = [
    { field: "id", headerName: "ID", width: 200 },
    { field: "name", headerName: "Name", width: 150 },
    { field: "status", headerName: "Status", width: 150 },
  ];

  return (
    <Box sx={{ height: 600, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSizeOptions={[10]}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </Box>
  );
};

export default GamesTab;
