import { configureStore } from '@reduxjs/toolkit'
import SettingsReducer from './Settings'

export default configureStore({
    reducer: {
        Settings: SettingsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
})
