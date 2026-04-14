export const API_CONFIG = {
  DEFAULT: {
    BASE_URL: import.meta.env.VITE_API_BASE_URL + "/configurations",
    TIMEOUT: 30000, // 30 seconds
    DEFAULT_HEADERS: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    ENDPOINTS: {
      PROJECTS: "/Project",
      ARCHIVE: "/Project/archived",

      // subflow endpoints
      TEMPLATES: "/Project/Subflow",
      SUBFLOWS: "/Subflow",
      SUBFLOW: (subflowId: string) => `/Subflow/${subflowId}`,
      SUBFLOW_CONFIGURATION: (fileId: string) => `/Subflow/${fileId}`,
      CREATE_SUBFLOW_CONFIGURATION: (fileId: string) => `/Subflow/${fileId}`,
      CREATE_SUBFLOW_CONFIGURATION_VARIABLES: ({ $fileId }: { $fileId: string }) => `/Subflow/${$fileId}`,
      UPDATE_SUBFLOW_CONFIGURATION: (configId: string) => `/Subflow/${configId}`,
      SUBFLOW_INPUTS_OUTPUTS: (subflowId: string) => `/Subflow/${subflowId}/InputsOutputs`,
      DELETE_SUBFLOW: (subflowId: string) => `/Subflow/${subflowId}`,
      SUBFLOW_CONFIGURATION_HISTORY: (fileId: string) => `/Subflow/${fileId}/history`,
      SUBFLOW_CONFIGURATION_RESTORE: (configId: string) => `/Subflow/${configId}/restore`,

      PROJECT: (projectId: string) => `/Project/${projectId}`,
      ARCHIVE_PROJECT: (projectId: string) => `/Project/${projectId}/Archive`,
      RESTORE_PROJECT: (projectId: string) => `/Project/${projectId}/Restore`,
      ARCHIVED_PROJECT: (projectId: string) => `/Project/${projectId}/archived-files`,
      DUPLICATE_PROJECT: (projectId: string) => `/Project/Duplicate/${projectId}`,

      // file endpoints
      FILES: "/File",
      FILE: (fileId: string) => `/File/${fileId}`,
      FILE_SYSTEM_RULES: (fileId: string) => `/File/${fileId}/SystemRules`,
      FILE_AGENT_SYSTEM_RULES: (fileId: string, agentKey: string) => `/File/${fileId}/SystemRules/${agentKey}`,
      DUPLICATE_FILE: (fileId: string) => `/File/${fileId}/Duplicate`,
      ARCHIVE_FILE: (fileId: string) => `/File/${fileId}/Archive`,
      RESTORE_FILE: (fileId: string) => `/File/${fileId}/Restore`,

      // configuration endpoints
      CONFIGURATION: (fileId: string) => `/Configuration/${fileId}`,
      CONFIGURATION_BY_FILE_ID: (fileId: string) => `/Configuration/file/${fileId}/live`,
      CONFIGURATION_HISTORY: (fileId: string) => `/Configuration/${fileId}/history`,
      CONFIGURATION_RESTORE: (configId: string) => `/Configuration/${configId}/restore`,
      CREATE_CONFIGURATION: (fileId: string) => `/Configuration/${fileId}`,
      UPDATE_CONFIGURATION: (configId: string) => `/Configuration/${configId}`,
      LAYOUT_CONFIGURATION: "/Configuration/CalculateLayout",

      // Branches
      PUBLISH_BRANCH:
        (fileId: string) =>
        ({ $fileId }: { $fileId?: string } = {}) =>
          `/Configuration/publishBranch/${$fileId || fileId}`,
      CREATE_BRANCH: "/File/branch",
      BRANCHES: (fileId: string) => `/File/branches/${fileId}`,
      UNPUBLISH_BRANCH:
        (fileId: string) =>
        ({ $fileId }: { $fileId?: string } = {}) =>
          `/Configuration/unpublish/${$fileId || fileId}`,
      PULL_LATEST_CHANGES: ({ $fileId }: { $fileId?: string } = {}) => `/Configuration/pullBranch/${$fileId}`,

      // dataset endpoints
      DATASET: "/Dataset",
      DATASET_SUBSETS: "/Dataset/subsets",
      DATASET_VERSION: ({ $datasetVersionId }: { $datasetVersionId: string }) => `/DatasetVersion/${$datasetVersionId}`,
      DATASET_BY_ID: (datasetId: string) => `/Dataset/${datasetId}`,
      DATASET_INFO: (datasetId: string) => `/Dataset/${datasetId}/info`,
      DATASET_VERSIONS: (datasetId: string) => `/Dataset/${datasetId}/versions`,
      DATASET_JSONL_SAMPLE: "/Dataset/sample-jsonL",

      // upload endpoint
      UPLOAD: "/Upload",

      // config converter endpoints
      CONFIGURATION_CONVERTER: "/ConfigConverter/template",

      // configuration dataset mapping
      CONFIGURATION_DATASET_MAPPING: (configId: string) => `/ConfigurationDatasetMapping/${configId}`,
      CONFIGURATION_DATASET_MAPPING_GET_BY_ID: (fileId: string) => `/ConfigurationDatasetMapping/${fileId}/latestMappingByFileId`,
      CONFIGURATION_DATASET_MAPPING_BY_DATASET_ID: "/ConfigurationDatasetMapping/configuration-and-dataset",
      CONFIGURATION_DATASET_MAPPING_CREATE: "/ConfigurationDatasetMapping/v2",
      CONFIGURATION_DATASET_MAPPING_CREATE_OLD: "/ConfigurationDatasetMapping",
      DATASET_VERSION_ID: (datasetVersionId: string) => `/DatasetVersion/${datasetVersionId}`,

      // preprocessing functions
      PREPROCESSING_FUNCTION: "/PreprocessingFunction",

      //email connectors
      MICROSOFT_AUTHORIZE: "/EmailConnector/authorize",
      MICROSOFT_AUTHORIZE_CALLBACK: "/EmailConnector/callback",
      EMAILCONNECTOR_USERS: "/EmailConnector/users",
      EMAILCONNECTOR_USERDISPLAY: ({ $userId, $userDisplay }: { $userId: string; $userDisplay: string }) =>
        `/EmailConnector/UserDisplay?userId=${$userId}&userDisplay=${$userDisplay}`,
      EMAILCONNECTOR_FOLDERS: (accountId: string) => `/EmailConnector/folders/${accountId}`,
      DELETE_CONNECTOR_USER: (accountId: string) => `/EmailConnector/${accountId}`,

      // tasks endpoint
      TASKS: "/Tasks",

      // azure storage accounts
      STORAGE_ACCOUNTS_LIST: "StorageAccount/list",

      // agent
      AGENT: "/Agent",
      AGENT_BY_ID: (agentId: string) => `/Agent/${agentId}`,

      INVITATIONS: "/Invitation/send",
    },
  },
  UPLOAD: {
    BASE_URL: import.meta.env.VITE_API_BASE_URL + "/configurations",
    TIMEOUT: undefined,
    DEFAULT_HEADERS: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    ENDPOINTS: {
      UPLOAD: "/Upload",
    },
  },
  SCHEDULER: {
    BASE_URL: import.meta.env.VITE_API_BASE_URL + "/scheduler",
    TIMEOUT: 30000, // 30 seconds
    DEFAULT_HEADERS: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    ENDPOINTS: {
      JOB_START: "/Job/start-graph-with-inputs",
      SUBFLOW_JOB_START: "/Job/Subflow/start-graph-with-inputs",
      JOB_CANCEL: (jobId: string) => `/Job/${jobId}/Cancel`,
      NODE_OUTPUT: "/Node/Output",
      NODE_RESULT: "/Node/node-result",
      NODE_STATUS: "/Node/node-result/node-status",
      DOWNLOAD_RAW_FILE: "/Node/download-raw-file",
      RUN_TEST: "/Node/Test-Run",
      RECENT_SAMPLES: "/Job",
      GET_SAMPLE: (jobId: string) => `/Job/${jobId}`,
      LATEST_SAMPLE: (fileId: string) => `/Job/latest/${fileId}`,
      DATASET_SAMPLE: "/Evaluator/dataset-sample",

      // evaluation endpoints
      EVALUATION: (batchId: string) => `/EvaluationResult/${batchId}`,
      EVALUATION_HISTORY: (fileId: string) => `/Batch/${fileId}/Batches`,
      EVALUATION_DELETE: (batchId: string) => `/Batch/${batchId}`,
      START_EVALUATION: "/Evaluator",
      PAUSE_RESUME_EVALUATION:
        (batchId: string) =>
        ({ $pausing }: { $pausing: "pause" | "resume" }) =>
          `/Evaluator/${$pausing}/${batchId}`,
      SUBSET_FILTER: "/node-result/subset",
      SUBSET_SAVE: "/subset",
      SUBSET_BY_DATASET: (datasetId: string) => `/Subset/by-dataset/${datasetId}`,

      DOWNLOAD_SAMPLES_LOGS: "/Node/node-result/download-node-logs",
      // MONITORING
      MONITORING_TIME_SERIES_DATA: (fileId: string) => `/Monitoring/${fileId}/Time-Series`,
      MONITORING_ANALYTICS_CARDS: (fileId: string) => `/Monitoring/${fileId}/Analytics-Cards`,
      MONITORING_PERFORMANCE_METRICS: (fileId: string) => `/Monitoring/${fileId}/Performance-Metrics`,
      MONITORING_LIVE_ACTIVITY: (fileId: string) => `/Monitoring/${fileId}/Live-Activity`,
      MONITORING_LIVE_WORKFLOW: (fileId: string) => `/Monitoring/${fileId}/Live-Workflow`,
      MONITORING_SUBSET_FILTER: "/node-result/monitoring-workflow",
    },
  },
  LOGS: {
    BASE_URL: import.meta.env.VITE_API_BASE_URL + "/logs",
    TIMEOUT: 30000, // 30 seconds
    DEFAULT_HEADERS: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    ENDPOINTS: {
      NODE_LOGS: "/Logs/engine",
    },
  },
  GENONE: {
    BASE_URL: import.meta.env.VITE_GENONE_BASE_URL,
    TIMEOUT: 60000, // 60 seconds for AI processing
    DEFAULT_HEADERS: {
      Accept: "application/json",
    },
    ENDPOINTS: {
      GENONE_ORCHESTRATOR: "/genone_orchestrator",
      ORCHESTRATION_DESCRIPTION_GENERATION: "/orchestration_description_generation",
    },
  },
  SECURITY: {
    BASE_URL: import.meta.env.VITE_API_BASE_URL + "/security",
    TIMEOUT: 30000, // 30 seconds
    DEFAULT_HEADERS: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    ENDPOINTS: {
      ACCESS_REQUEST: "/access-request",
      AUTH_VALIDATE: "/auth/validate",
      ROLES: "/roles",
      ROLE_BY_ID: (id: string) => `/roles/${id}`,
      USERS: "/users",
      USER_ROLES: "/users/roles",
      USERS_DASHBOARD: "/UserPermission/users-dashboard",
      WORKFLOWS_DASHBOARD: "/UserPermission/workflows-dashboard",
      PROJECTS_DASHBOARD: "/UserPermission/projects-dashboard",
      USERS_PROJECTS: (userId: string) => `/UserPermission/user/${userId}/projects`,
      USERS_WORKFLOWS: (userId: string) => `/UserPermission/user/${userId}/workflows`,
      PERMISSIONS_BATCH_UPDATE: "/UserPermission/batch",
      ENTITY_USERS: (entityId: string) => `/UserPermission/entity/${entityId}/users`,
      USERS_WITH_NO_ACCESS: "/UserPermission/users-with-no-access",
      ROLES_LOWER_RANKS: "/roles/lower-ranks",
      ROLE_PERMISSIONS_MATRIX: "/role-permissions-matrix",
      USER_PROFILES: "/users/me/profile",
      UPDATE_USER_PROFILE: "/users/me/profile",
      INVITATION_LOGS: "/invitation-logs",
    },
  },
};

export default API_CONFIG;
