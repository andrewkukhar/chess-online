// client/src/services/api-services/check.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const checkApi = createApi({
  reducerPath: "check",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_BACKEND_URL}/api/check/`,
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Check"],
  endpoints: (builder) => ({
    checkAAdminRole: builder.query({
      query: (userId) => ({
        url: `check-aadmin-role`,
        method: "GET",
      }),
      skip: (userId) => !userId,
      providesTags: ["Check"],
    }),
  }),
});

export const { useCheckAAdminRoleQuery } = checkApi;
export default checkApi;
