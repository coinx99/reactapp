/**
 * quản lí các cài đặt của người dùng
 */
import BigNumber from "bignumber.js";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { EventEmitter } from "events";
const { log, warn, error } = console

/**
 * "changed" | "loaded" | "saved" | "NameTokenChaged"
 */
export var SettingsEvent = new EventEmitter();

// loadSettings sẽ lấy cài đặt từ localStorage
export const loadSetting = createAsyncThunk(
    "loadSettings",
    async (args, thunkAPI) => {
        let { setting } = await thunkAPI.getState().Settings
        let _setting = JSON.parse(localStorage.getItem("setting"))
        if (_setting) {
            return { before: setting, after: _setting };
        } else throw new Error("SETTING_NOT_FOUND")
    }
)

// saveSetting sẽ lưu cài đặt vào localStorage
export const saveSetting = createAsyncThunk(
    "saveSettings",
    async ({ key, value }, thunkAPI) => {
        let { setting } = await thunkAPI.getState().Settings
        let _setting = JSON.parse(JSON.stringify(setting));
        console.warn(key, value)

        let keys = key.split('.');
        let lastkey = keys[keys.length - 1].trim();
        let obj = keys.slice(0, keys.length - 1).reduce((acc, key) => acc[key], _setting)


        console.warn(obj, lastkey)
        obj[lastkey] = value;

        localStorage.setItem("setting", JSON.stringify(_setting))

        SettingsEvent.emit(key, value)

        return { before: setting, after: _setting };
    }
)

export const defaultSettings = {
    telegram: {
        token: "",
        chatId: {
            dashboard: "-",
        }
    },
    language: "en",
    theme: "dark",
    domain: "coinx.trade",
}

export const Settings = createSlice({
    name: "Settings",
    initialState: { setting: defaultSettings },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(loadSetting.fulfilled, (state, action) => {
            state.setting = action.payload.after
            setTimeout(() => {
                SettingsEvent.emit("loaded", action.payload)
            }, 100);
        })

        // builder.addCase(loadSetting.rejected, (state, action) => {
        //     SettingsEvent.emit("changed", state.setting)
        // })

        builder.addCase(saveSetting.fulfilled, (state, action) => {
            state.setting = action.payload.after
            SettingsEvent.emit("saved", action.payload)
        })
    },
})


export const { } = Settings.actions;

export default Settings.reducer;