/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * API Base URL for all requests
   */
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_FLOW_STORAGE_URL: string;
  readonly VITE_NOTIFICATION_HUB_URL: string;
  readonly VITE_COLLAB_WS: string;

  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
