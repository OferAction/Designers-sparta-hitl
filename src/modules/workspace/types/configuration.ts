// Version interfaces
export interface Version {
  major: number;
  minor: number;
  patch: number;
  timestamp: string;
}

export interface VersionInfo {
  id: string;
  fileId: string;
  version: Version;
  savedBy?: string;
  publishedFrom?: string;
}

export interface ConfigurationVersion {
  id: string;
  frontendConfigurationSerialized: string;
  fileId: string;
  version: Version;
}

export interface CreateConfigurationPayload {
  frontendConfigurationSerialized: string;
}

// Payload type for updating a configuration
export interface UpdateConfigurationPayload {
  frontendConfigurationSerialized: string;
  fileId: string;
}

export interface ConfigurationUpdateResponse {
  id: string;
  fileId: string;
  version: Version;
}
export interface LayoutConfigurationPayload {
  frontendConfigurationSerialized: string;
}

export interface LayoutConfigurationResponse {
  frontendConfigurationSerialized: string;
}

export type VersionHistoryResponse = VersionInfo[];
