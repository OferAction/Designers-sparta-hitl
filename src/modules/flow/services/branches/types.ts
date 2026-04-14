export type PublishBranchBody = {
  name: string;
  description?: string;
  projectId?: string;
  type?: string;
};

export type CreateBranchBody = {
  name: string;
  description?: string;
  projectId?: string;
  parentFileId: string;
  type?: string;
};
