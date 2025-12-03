// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5003",
  timeout: 30000,
});

// set token in default headers and localStorage
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
}

// initialize from storage (if present)
const stored = localStorage.getItem("token");
if (stored) {
  api.defaults.headers.common["Authorization"] = `Bearer ${stored}`;
}

export default api;
