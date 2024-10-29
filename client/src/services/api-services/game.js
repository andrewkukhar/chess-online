// client/src/services/api-services/auth.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const gameApi = createApi({
  reducerPath: "game",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_BACKEND_URL}/api/games/`,
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Game"],
  endpoints: (builder) => ({
    createGame: builder.mutation({
      query: (name) => ({
        url: "create-game",
        method: "POST",
        body: { name },
      }),
      invalidatesTags: ["Game"],
    }),
    updateGame: builder.mutation({
      query: ({ gameId, status }) => ({
        url: `update-game/${gameId}`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Game"],
    }),
    joinGame: builder.mutation({
      query: ({ gameId, playerId }) => ({
        url: "join-game",
        method: "POST",
        body: { gameId, playerId },
      }),
      invalidatesTags: ["Game"],
    }),
    leaveGame: builder.mutation({
      query: ({ gameId, playerId }) => ({
        url: "leave-game",
        method: "POST",
        body: { gameId, playerId },
      }),
      invalidatesTags: ["Game"],
    }),
    removeGame: builder.mutation({
      query: (gameId) => ({
        url: `delete-game/${gameId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Game"],
    }),
    getGame: builder.query({
      query: (gameId) => `get-game/${gameId}`,
      skip: (gameId) => !gameId,
      providesTags: (result, error, gameId) => [{ type: "Game", id: gameId }],
    }),
    getAllGames: builder.query({
      query: () => "get-all-games",
      // skip: (userId) => !userId,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: "Game", id: _id })),
              { type: "Game", id: "LIST" },
            ]
          : [{ type: "Game", id: "LIST" }],
    }),
  }),
});

export const {
  useCreateGameMutation,
  useUpdateGameMutation,
  useJoinGameMutation,
  useLeaveGameMutation,
  useRemoveGameMutation,
  useGetGameQuery,
  useGetAllGamesQuery,
} = gameApi;
export default gameApi;