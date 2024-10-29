// client/src/services/api-services/auth.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const moveApi = createApi({
  reducerPath: "move",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_BACKEND_URL}/api/moves/`,
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Move"],
  endpoints: (builder) => ({
    makeMove: builder.mutation({
      query: ({ gameId, move }) => ({
        url: "make-move",
        method: "POST",
        body: { gameId, move },
      }),
      invalidatesTags: (result, error, { gameId }) => [
        { type: "Move", id: `GAME_${gameId}` },
      ],
    }),
    getMove: builder.query({
      query: ({ moveId }) => ({
        url: `get-move/${moveId}`,
        method: "GET",
      }),
      skip: (moveId) => !moveId,
      providesTags: (result, error, moveId) => [{ type: "Move", id: moveId }],
    }),
    getAllMoves: builder.query({
      query: (gameId) => ({
        url: `get-game-moves/${gameId}`,
        method: "GET",
      }),
      skip: (gameId) => !gameId,
      providesTags: (result, error, gameId) => [
        { type: "Move", id: `GAME_${gameId}` },
      ],
    }),
    undoMove: builder.mutation({
      query: ({ gameId }) => ({
        url: "undo-move",
        method: "POST",
        body: { gameId },
      }),
      invalidatesTags: (result, error, { gameId }) => [
        { type: "Move", id: `GAME_${gameId}` },
      ],
    }),
  }),
});

export const {
  useMakeMoveMutation,
  useGetMoveQuery,
  useGetAllMovesQuery,
  useUndoMoveMutation,
} = moveApi;
export default moveApi;
