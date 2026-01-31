import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { tokenStorage } from "../../utils/tokenStorage.utils";
import { loginUserValidation, logoutUser as logoutUserService } from "../../services/LMSGateway";
// import { persistor } from "../store/store";
export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (payload, { dispatch }) => {
        const res = await loginUserValidation(dispatch, payload);
        const data = res?.data?.response;
        tokenStorage.clearAll();
        tokenStorage.setAccessToken(data.accessToken || data.token);
        if (data.user) tokenStorage.setUserToken(JSON.stringify(data.user));
        if (data.refreshToken) tokenStorage.setRefreshToken(data.refreshToken);
        return res;
    }
);

export const performLogout = createAsyncThunk(
    'auth/performLogout',
    async (_, { dispatch }) => {
        // try {
        //     await logoutUserService(dispatch);
        // } catch (e) {
        //     // ignore backend errors but continue to clear client
        // }
        tokenStorage.clearAll();
        return true;
    }
);

const initialState = {
    user: JSON.parse(tokenStorage.getUserToken()),
    token: tokenStorage.getAccessToken(),
    loading: false,
    error: null,
    isAuthenticated: !!tokenStorage.getAccessToken(),
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            tokenStorage.clearAll();
        },
        setCredentials: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.token = action.payload?.data?.response?.accessToken || action.payload.token;
                state.user = action.payload?.data?.response?.user || null;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
            });
        builder.addCase(performLogout.fulfilled, (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.loading = false;
        });
    },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;
