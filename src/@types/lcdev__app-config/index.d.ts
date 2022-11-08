// AUTO GENERATED CODE
// Run app-config with 'generate' command to regenerate this file

import '@app-config/main';

/**
 * Properties for API configuration
 */
export interface Config {
  api_client_id: string;
  db_url: AuthURL;
  issuer_url: URL;
  meta_url: URL;
  port: number;
  tennant: string;
  valid_origins: string[];
}

/**
 * Properties for a URL with basic auth
 */
export interface AuthURL {
  pass: string;
  url: URL;
  user: string;
}

/**
 * Properties for a URL configuration
 */
export interface URL {
  host: string;
  path?: string;
  port: number;
  proto: string;
  query?: string;
}

// augment the default export from app-config
declare module '@app-config/main' {
  export interface ExportedConfig extends Config {}
}
