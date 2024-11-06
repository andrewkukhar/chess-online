// client/src/services/api-services/user.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const userApi = createApi({
  reducerPath: "user",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_BACKEND_URL}/api/users/`,
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: () => ({
        url: "get-all-users",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    getUserById: builder.query({
      query: (userId) => ({
        url: `get-user/${userId}`,
        method: "GET",
      }),
      skip: (userId) => !userId,
      providesTags: (result, error, userId) => [{ type: "User", id: userId }],
    }),
    updateUserById: builder.mutation({
      query: ({ userId, userData }) => ({
        url: `update-user/${userId}`,
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "User", id: userId },
      ],
    }),
    deleteUserById: builder.mutation({
      query: (userId) => ({
        url: `delete-user/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    changeUserRole: builder.mutation({
      query: ({ userId, role }) => ({
        url: `update-user-role/${userId}`,
        method: "PUT",
        body: { role },
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "User", id: userId },
      ],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserByIdMutation,
  useDeleteUserByIdMutation,
  useChangeUserRoleMutation,
} = userApi;
export default userApi;
