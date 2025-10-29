import authReducer from "./features/auth/auth-slice"
import profileReducer from './features/auth/profileSlice'   
import projectReducer from './features/auth/projectSlice'
import communitiesReducer from './features/auth/communitiesSlice'
import eventsReducer from './features/auth/eventsSlice'
import blogReducer from "./features/auth/blogSlices"
import dashboardReducer from './features/auth/dashboardSlices'
import qaReducer from './features/auth/qaSlice'
import homepageReducer from "@/lib/features/auth/homePageSlice"
import CommunityChatReducer from "@/lib/features/communityChat/communityChatSlice"
import { configureStore, combineReducers } from "@reduxjs/toolkit"
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist"
import storage from "redux-persist/lib/storage"
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["login"], 
  transforms: [
    {
      in: (inboundState: any, key: PropertyKey) => {
        if (key === 'login' && inboundState) {
          return {
            ...inboundState,
            loading: false,
          }
        }
        return inboundState
      },
      out: (outboundState: any, key: PropertyKey) => {
        if (key === 'login' && outboundState) {
          return {
            ...outboundState,
            loading: false,
          }
        }
        return outboundState
      },
    },
  ],
}

const rootReducer = combineReducers({
      auth: authReducer,

     profile: profileReducer,
     projects: projectReducer,
     communities: communitiesReducer,
     events: eventsReducer,
     qa: qaReducer,
     blog: blogReducer,
     dashboard: dashboardReducer,
     homepage: homepageReducer,
     communityChat:CommunityChatReducer


})

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

const persistor = persistStore(store)

export { store, persistor }
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch