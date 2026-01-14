import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api"
});

export const searchNotes = (q) =>
  api.get(`/notes/search?q=${q}`);

export default api;
