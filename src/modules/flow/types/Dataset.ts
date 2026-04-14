export type DatasetResponse = {
  id: string;
  name: string;
  createdTime: string;
  activeVersionId: string;
  samplesCount: number;
  configurationNames?: string[];
};
