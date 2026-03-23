import axios from "axios";

const api = axios.create({
  baseURL: "https://yappyyap.xyz",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
