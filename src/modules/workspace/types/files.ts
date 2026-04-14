import { Version } from "./configuration";
import { TextHighlightPart } from "../utils/searchHighlight";

type FileStatus = "Draft" | "Live";

export interface FileItem {
  id: string;
  name: string;
  lastUpdated: string;
  status?: FileStatus;
  type?: "file";
  img?: string;
}

export type ArchivedFileItem = FileItem & {
  folderId?: string;
};

export interface systemRules {
  type: number;
  name: string;
  agent: string[];
  action: "terminate" | "continue" | "retry" | "route";
  routeId?: string;
}
export interface RulesRouteConfig {
  defaultAgenticRoute: string;
  agenticRoutingEnabled: boolean;
  defaultCustomRoute: string;
  customRoutingEnabled: boolean;
  defaultSystemRoute: string;
  systemRoutingEnabled: boolean;
}

export interface File {
  id: string;
  name: string;
  description: string;
  projectId: string;
  updateTime: string;
  activeConfigurationId?: string;
  version: Version;
  systemRules: systemRules[];
  highlightParts?: TextHighlightPart[];
  status?: FileStatus;
  parentFileId?: string;
  type?: string;
  rulesRouteConfig?: RulesRouteConfig;
  isLatestVersion?: boolean;
  owner?: string;
  thumbnailBase64: string;
  thumbnailUTC: string;
}

export type FileCreateRequest = Pick<File, "name" | "description"> & {
  projectId?: string;
};

export type FileUpdateRequest = File;
