import axios from "axios";
import { supabase } from "../lib/supabaseClient";

export const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:5000/api",
});

api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // TODO: redirect to /login or trigger a session refresh
      // eslint-disable-next-line no-console
      console.warn("Unauthorized — session may have expired");
    }
    return Promise.reject(error);
  }
);
