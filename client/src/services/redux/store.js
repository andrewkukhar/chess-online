// client/src/services/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authApi from "../api-services/auth";
import gameApi from "../api-services/game";
import moveApi from "../api-services/move";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [gameApi.reducerPath]: gameApi.reducer,
    [moveApi.reducerPath]: moveApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(gameApi.middleware)
      .concat(moveApi.middleware),
});
