import { API_URL } from "./config";

export function apiFetch(path: string, options?: RequestInit) {
  return fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
  });
}
