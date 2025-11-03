import { configureStore, combineReducers } from "@reduxjs/toolkit"; // 👈 Import combineReducers
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import authReducer from "./authSlice";
import votingReducer from "./votingSlice";

// 1. Combine all slice reducers into a root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  voting: votingReducer,
});

// 2. Define the persistence configuration
const persistConfig = {
  key: "root",
  storage,
  // 3. Apply the whitelist to the root reducer
  // Only the 'auth' slice (key) will be persisted and rehydrated
  whitelist: ["auth"],
  // If you wanted to *exclude* 'voting', you'd use 'blacklist: ["voting"]'
};

// 4. Wrap the rootReducer with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  // 5. Use the persisted root reducer
  reducer: persistedReducer,
  // 6. Recommended middleware configuration for redux-persist
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE", "persist/REGISTER"],
      },
    }),
});

export const persistor = persistStore(store);
