import { createApiQuery } from "@/api";
import API_CONFIG from "@/config/api.config";

import type { AgentWithTemplate } from "./agentTypes";

const apiClientKey = "DEFAULT";
const CONFIG = API_CONFIG[apiClientKey];

export const getAgentsWithTemplatesQuery = (includeInactive = false) =>
  createApiQuery<AgentWithTemplate[]>(
    CONFIG.ENDPOINTS.AGENT,
    ["agentsWithTemplates", includeInactive ? "1" : "0"],
    { apiClientKey },
    { params: { includeInactive } }
  );
