import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // 🔑 cookie lives here
});

/*
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
            await api.post("/auth/refresh")
            return api(originalRequest)
        }

        return Promise.reject(error)
    }
)*/
