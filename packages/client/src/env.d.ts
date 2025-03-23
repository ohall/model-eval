/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_API_URL: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_HEROKU_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  ENV?: {
    API_URL: string;
    ENV: string;
    APP_VERSION: string;
  };
}