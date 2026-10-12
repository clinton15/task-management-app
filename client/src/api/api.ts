import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
