const ACCESS = "accessToken";
const REFRESH = "refreshToken";

export function getAccessToken() {
  return localStorage.getItem(ACCESS);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH);
}

export function setTokens({ accessToken, refreshToken }) {
  if (accessToken) {
    localStorage.setItem(ACCESS, accessToken);
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH, refreshToken);
  }
}

export function clearTokens() {
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
}
