// src/components/ak-admin/tabs/MovesTab.js
import React from "react";
import { useGetAllMovesQuery } from "../../../services/api-services/move";
import { CircularProgress, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const MovesTab = () => {
  const { data: moves, isLoading } = useGetAllMovesQuery();

  if (isLoading) {
    return <CircularProgress />;
  }

  // Map `_id` to `id`
  const rows =
    moves?.map((move) => ({
      ...move,
      id: move._id,
    })) || [];

  const columns = [
    { field: "id", headerName: "Move ID", width: 200 },
    { field: "gameId", headerName: "Game ID", width: 200 },
    { field: "playerId", headerName: "Player ID", width: 200 },
    { field: "move", headerName: "Move", width: 150 },
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

export default MovesTab;
