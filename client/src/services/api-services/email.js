// client/src/services/api-services/email.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const emailApi = createApi({
  reducerPath: "email",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_BACKEND_URL}/api/emails/`,
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Email"],
  endpoints: (builder) => ({
    sendGameLink: builder.mutation({
      query: ({ email, gameId }) => ({
        url: `send-game-link/${gameId}`,
        method: "POST",
        body: { email },
      }),
    }),
  }),
});

export const { useSendGameLinkMutation } = emailApi;
export default emailApi;
