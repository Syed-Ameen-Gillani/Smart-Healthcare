import { Capacitor } from "@capacitor/core";
import { SecureStorage } from "@aparajita/capacitor-secure-storage";

const DEFAULT_API_URL = "http://localhost:8000";

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || DEFAULT_API_URL
).replace(/\/$/, "");

export const IS_NATIVE = Capacitor.isNativePlatform();

let accessToken = null;
const SESSION_TOKEN_KEY = "smart-health-session-token";

export function setAccessToken(token) {
  accessToken = token || null;
}

/**
 * Keeps the native JWT in Android's encrypted app storage. Web sessions still
 * use the HttpOnly cookie set by FastAPI, so no web token is persisted here.
 */
export async function persistAccessToken(token) {
  setAccessToken(token);

  if (!IS_NATIVE || !token) return;

  try {
    await SecureStorage.setItem(SESSION_TOKEN_KEY, token);
    console.info("[session] Native session saved");
  } catch (error) {
    // Login remains usable in this process even if a device has not been synced.
    console.warn("[session] Native session could not be saved", error);
  }
}

export async function restoreAccessToken() {
  if (!IS_NATIVE) return false;

  try {
    const token = await SecureStorage.getItem(SESSION_TOKEN_KEY);
    if (!token) {
      console.info("[session] No saved native session found");
      return false;
    }

    setAccessToken(token);
    console.info("[session] Native session restored");
    return true;
  } catch (error) {
    console.warn("[session] Native session could not be restored", error);
    return false;
  }
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  const hadToken = Boolean(accessToken);
  accessToken = null;

  if (IS_NATIVE) {
    SecureStorage.removeItem(SESSION_TOKEN_KEY).catch((error) => {
      console.warn("[session] Native session could not be cleared", error);
    });
  }

  if (hadToken && typeof window !== "undefined") {
    window.dispatchEvent(new Event("smarthealth:session-expired"));
  }
}

export function getAuthHeaders(headers = {}) {
  const result = new Headers(headers);
  if (accessToken) {
    result.set("Authorization", `Bearer ${accessToken}`);
  }
  return result;
}

export async function authenticatedFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: getAuthHeaders(options.headers),
  });

  if (response.status === 401) {
    console.warn("[session] API returned 401; clearing the saved session");
    clearAccessToken();
  }

  return response;
}

export function getNotificationsWebSocketUrl() {
  const wsBase = API_BASE_URL.replace(/^http/, "ws");
  if (!accessToken) return `${wsBase}/ws/notifications`;
  return `${wsBase}/ws/notifications?token=${encodeURIComponent(accessToken)}`;
}
