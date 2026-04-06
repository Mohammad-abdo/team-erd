import { api } from "./client.js";

export function register(payload) {
  return api.post("/auth/register", payload);
}

export function login(payload) {
  return api.post("/auth/login", payload);
}

export function refresh(payload) {
  return api.post("/auth/refresh", payload);
}

export function logout(payload) {
  return api.post("/auth/logout", payload);
}

export function forgotPassword(payload) {
  return api.post("/auth/forgot-password", payload);
}

export function resetPassword(payload) {
  return api.post("/auth/reset-password", payload);
}
