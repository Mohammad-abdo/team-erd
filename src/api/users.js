import { api } from "./client.js";

export function getMe() {
  return api.get("/users/me");
}

export function patchMe(payload) {
  return api.patch("/users/me", payload);
}
