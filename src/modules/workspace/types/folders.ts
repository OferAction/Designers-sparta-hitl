import { TextHighlightPart } from "../utils/searchHighlight";
import { NodeInputItem, NodeOutput } from "@/modules/flow/types";
import type { FileItem, ArchivedFileItem, File } from "@/modules/workspace/types/files";

export interface Folder {
  id: string;
  name: string;
  files: FileItem[];
  lastUpdated: string;
  type: "folder";
}

export type WorkspaceItem = Folder | FileItem;
export type Workspace = (Folder | FileItem)[];
export type Archive = Array<ArchivedFileItem | Folder>;

export interface ProjectBase {
  id: string;
  name: string;
  description: string;
  isFile?: boolean;
  isSubflow?: boolean;
  files?: File[];
  updateTime: string;
}

export interface Project extends ProjectBase {
  isFile?: false;
  files?: File[];
  highlightParts?: TextHighlightPart[];
}

export interface Subflow extends ProjectBase {
  isFile: true;
  isSubflow: true;
  files: File[];
}
export interface TopFile extends ProjectBase {
  isFile: true;
  files: [File];
}

// Complete response for projects endpoint
export type ProjectResponse = Project | TopFile;
export type ProjectsResponse = ProjectResponse[];

export type TemplateResponse = Subflow;
export type TemplatesResponse = [TemplateResponse];

export type SubflowInputOutput = {
  start: NodeInputItem[];
  end: NodeOutput[];
};

export type ProjectCreateRequest = Pick<ProjectBase, "name" | "description">;
export type ProjectUpdateRequest = Project;
