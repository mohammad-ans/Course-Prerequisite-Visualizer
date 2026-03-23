import axios from "axios";

const api = axios.create({
  baseURL: "https://api.yappyyap.xyz",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
