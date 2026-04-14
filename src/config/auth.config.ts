export const AUTH_CONFIG = {
  AZURE: {
    CLIENT_ID: import.meta.env.VITE_AZURE_CLIENT_ID,
    TENANT_ID: import.meta.env.VITE_AZURE_TENANT_ID,
    REDIRECT_URI: import.meta.env.VITE_AZURE_REDIRECT_URI || `${window.location.origin}/auth/callback`,
    SCOPE: import.meta.env.VITE_AZURE_SCOPE || "openid profile email",
    AUTHORITY: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}`,
    AUTH_URL: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}/oauth2/v2.0/authorize`,
    TOKEN_URL: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}/oauth2/v2.0/token`,
  },
  STORAGE_KEYS: {
    ACCESS_TOKEN: "azure_access_token",
    REFRESH_TOKEN: "azure_refresh_token",
    USER_INFO: "user_info",
    EXPIRES_AT: "token_expires_at",
  },
};

export default AUTH_CONFIG;
