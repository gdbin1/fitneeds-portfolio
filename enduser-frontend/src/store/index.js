// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice'; // <--- 여기서 authReducer를 임포트

const store = configureStore({
    reducer: {
        auth: authReducer,
    },
    devTools: import.meta.env.MODE !== 'production'
});

export default store;