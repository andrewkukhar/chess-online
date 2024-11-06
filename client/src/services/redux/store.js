// client/src/services/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authApi from "../api-services/auth";
import userApi from "../api-services/user";
import checkApi from "../api-services/check";
import gameApi from "../api-services/game";
import moveApi from "../api-services/move";
import emailApi from "../api-services/email";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [checkApi.reducerPath]: checkApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [gameApi.reducerPath]: gameApi.reducer,
    [moveApi.reducerPath]: moveApi.reducer,
    [emailApi.reducerPath]: emailApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(checkApi.middleware)
      .concat(userApi.middleware)
      .concat(gameApi.middleware)
      .concat(moveApi.middleware)
      .concat(emailApi.middleware),
});
