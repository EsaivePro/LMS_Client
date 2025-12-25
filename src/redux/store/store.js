import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import courses from "../slices/coursesSlice";
import auth from "../slices/authSlice";
import permission from "../slices/permissionSlice";
import ui from "../slices/uiSlice";
import common from "../slices/commonSlice";
import admin from "../slices/adminSlice";
import topics from "../slices/topicsSlice";
import lessons from "../slices/lessonsSlice";
import users from "../slices/userSlice";
import role from "../slices/roleSlice";
import dashboard from "../slices/dashboardSlice";

import { setAxiosStore } from "../../apiClient/apiStoreProvider";

const rootReducer = combineReducers({ ui, dashboard, auth, courses, permission, common, admin, topics, lessons, users, role, dashboard });
const persistConfig = {
  key: "root",
  storage,
  whitelist: [],
};

const persisted = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persisted,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

setAxiosStore(store);   // <-- INJECT STORE HERE

export const persistor = persistStore(store);
persistor.purge();