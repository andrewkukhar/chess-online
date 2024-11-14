// client/src/services/api-services/game.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const gameAIApi = createApi({
  reducerPath: "game-ai",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_BACKEND_URL}/api/games-ai/`,
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["GameAI"],
  endpoints: (builder) => ({
    createGameAgainstAI: builder.mutation({
      query: ({ name, difficultyLevel }) => ({
        url: "create-game-against-ai",
        method: "POST",
        body: { name, difficultyLevel },
      }),
      invalidatesTags: ["GameAI"],
    }),
    makeAIMove: builder.mutation({
      query: ({ gameId }) => ({
        url: "make-ai-move",
        method: "POST",
        body: { gameId },
      }),
      invalidatesTags: (result, error, { gameId }) => [
        { type: "Move", id: `GAME_${gameId}` },
      ],
    }),
  }),
});

export const { useCreateGameAgainstAIMutation, useMakeAIMoveMutation } =
  gameAIApi;
export default gameAIApi;
