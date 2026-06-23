import axios from "axios";

const api = axios.create({
  baseURL: "/api", // ahora apunta al proxy
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

export default api;
