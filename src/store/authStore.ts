import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import AUTH_CONFIG from "@/config/auth.config";

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  preferred_username?: string;
  initials: string;
}

interface AuthState {
  // State
  isAuthenticated: boolean;
  user: UserInfo | null;
  loading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;

  // Actions
  signIn: () => Promise<void>;
  signOut: () => void;
  exchangeCodeForToken: (code: string, state: string) => Promise<void>;
  refreshAuthToken: () => Promise<string | null>;
  checkAuthStatus: () => void;
  setLoading: (loading: boolean) => void;

  // PKCE helpers (internal)
  generateAuthUrl: () => Promise<string>;
}

// Helper functions for PKCE
const generateCodeVerifier = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, Array.from(array)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
};

const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
};

const generateState = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const getInitials = (name: string): string => {
  return (name || " ").slice(0, 2).toUpperCase();
};

const parseTokenPayload = (token: string): Omit<UserInfo, "initials"> => {
  try {
    const payload = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payload));

    return {
      id: decodedPayload.oid || decodedPayload.sub,
      name: decodedPayload.name || decodedPayload.preferred_username,
      email: decodedPayload.email || decodedPayload.unique_name,
      preferred_username: decodedPayload.preferred_username,
    };
  } catch (error) {
    console.error("Failed to parse token:", error);
    throw new Error("Invalid token format");
  }
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        isAuthenticated: false,
        user: null,
        loading: true,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,

        checkAuthStatus: () => {
          const state = get();
          const { accessToken, expiresAt, refreshToken } = state;

          if (!accessToken || !expiresAt) {
            if (refreshToken) {
              get().refreshAuthToken();
              return;
            }
            set({
              isAuthenticated: false,
              user: null,
              loading: false,
              accessToken: null,
              refreshToken: null,
              expiresAt: null,
            });
            return;
          }

          const currentTime = Date.now();
          const bufferTime = 5 * 60 * 1000;
          const isValid = currentTime < expiresAt - bufferTime;

          if (!isValid) {
            get().refreshAuthToken();
            return;
          }
          set({
            isAuthenticated: true,
            loading: false,
          });
        },

        setLoading: (loading: boolean) => set({ loading }),

        generateAuthUrl: async () => {
          const state = generateState();
          const codeVerifier = generateCodeVerifier();
          const codeChallenge = await generateCodeChallenge(codeVerifier);

          localStorage.setItem("auth_state", state);
          localStorage.setItem("code_verifier", codeVerifier);

          const params = new URLSearchParams({
            client_id: AUTH_CONFIG.AZURE.CLIENT_ID,
            response_type: "code",
            redirect_uri: AUTH_CONFIG.AZURE.REDIRECT_URI,
            scope: AUTH_CONFIG.AZURE.SCOPE,
            state: state,
            code_challenge: codeChallenge,
            code_challenge_method: "S256",
            response_mode: "query",
          });

          return `${AUTH_CONFIG.AZURE.AUTH_URL}?${params.toString()}`;
        },

        signIn: async () => {
          const authUrl = await get().generateAuthUrl();
          window.location.href = authUrl;
        },

        exchangeCodeForToken: async (code: string, state: string) => {
          const currentState = get();

          if (currentState.isAuthenticated) {
            console.log("User already authenticated");
            return;
          }

          const storedState = localStorage.getItem("auth_state");
          if (storedState !== state) {
            console.warn("State validation failed, but continuing with token exchange");
          }

          const codeVerifier = localStorage.getItem("code_verifier");
          if (!codeVerifier) {
            if (currentState.isAuthenticated) {
              console.log("Already authenticated, skipping token exchange");
              return;
            }
            throw new Error("Missing code verifier");
          }

          const tokenRequestBody = new URLSearchParams({
            client_id: AUTH_CONFIG.AZURE.CLIENT_ID,
            grant_type: "authorization_code",
            code: code,
            redirect_uri: AUTH_CONFIG.AZURE.REDIRECT_URI,
            code_verifier: codeVerifier,
          });

          try {
            const tokenResponse = await fetch(AUTH_CONFIG.AZURE.TOKEN_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: tokenRequestBody,
            });

            if (!tokenResponse.ok) {
              const errorData = await tokenResponse.text();
              console.error("Token exchange error:", errorData);
              throw new Error("Failed to exchange code for token");
            }

            const tokenData = await tokenResponse.json();
            const userPayload = parseTokenPayload(tokenData.access_token);
            const userInfo: UserInfo = {
              ...userPayload,
              initials: getInitials(userPayload.name),
            };

            const expiresAt = Date.now() + tokenData.expires_in * 1000;

            set({
              isAuthenticated: true,
              user: userInfo,
              accessToken: tokenData.access_token,
              refreshToken: tokenData.refresh_token,
              expiresAt,
              loading: false,
            });

            localStorage.removeItem("auth_state");
            localStorage.removeItem("code_verifier");

            console.log("Token exchange successful");
          } catch (error) {
            localStorage.removeItem("auth_state");
            localStorage.removeItem("code_verifier");

            set({
              isAuthenticated: false,
              user: null,
              loading: false,
              accessToken: null,
              refreshToken: null,
              expiresAt: null,
            });

            throw error;
          }
        },

        refreshAuthToken: async () => {
          const { refreshToken: currentRefreshToken } = get();

          if (!currentRefreshToken) {
            console.log("No refresh token available");
            get().signOut();
            return null;
          }

          try {
            const tokenRequestBody = new URLSearchParams({
              client_id: AUTH_CONFIG.AZURE.CLIENT_ID,
              grant_type: "refresh_token",
              refresh_token: currentRefreshToken,
              scope: AUTH_CONFIG.AZURE.SCOPE,
            });

            const tokenResponse = await fetch(AUTH_CONFIG.AZURE.TOKEN_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: tokenRequestBody,
            });

            if (!tokenResponse.ok) {
              throw new Error("Failed to refresh token");
            }

            const tokenData = await tokenResponse.json();
            const expiresAt = Date.now() + tokenData.expires_in * 1000;

            set({
              accessToken: tokenData.access_token,
              refreshToken: tokenData.refresh_token,
              expiresAt,
              isAuthenticated: true,
              loading: false,
            });

            console.log("Token refreshed successfully");
            return tokenData.access_token;
          } catch (error) {
            console.error("Token refresh failed:", error);
            get().signOut();
            return null;
          }
        },

        signOut: () => {
          set({
            isAuthenticated: false,
            user: null,
            loading: false,
            accessToken: null,
            refreshToken: null,
            expiresAt: null,
          });

          localStorage.removeItem("auth_state");
          localStorage.removeItem("code_verifier");

          window.location.href = "/login";
        },
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({
          isAuthenticated: state.isAuthenticated,
          user: state.user,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          expiresAt: state.expiresAt,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.checkAuthStatus();
          }
        },
      }
    ),
    { enabled: import.meta.env.DEV, name: "AuthStore" }
  )
);

let refreshInterval: NodeJS.Timeout | null = null;

export const startTokenRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  refreshInterval = setInterval(
    () => {
      const { isAuthenticated, refreshAuthToken } = useAuthStore.getState();
      if (isAuthenticated) {
        refreshAuthToken().catch((error) => {
          console.error("Auto token refresh failed:", error);
        });
      }
    },
    15 * 60 * 1000
  );
};

export const stopTokenRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

startTokenRefresh();
