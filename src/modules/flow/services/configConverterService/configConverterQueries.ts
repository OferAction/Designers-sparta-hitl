import { createApiQuery } from "@/api";
import API_CONFIGS from "@/config/api.config";
import { FlowConfiguration } from "@/modules/flow/types";

const apiClientKey = "DEFAULT";
const CONFIG = API_CONFIGS[apiClientKey];

export const getConfigConverter = () =>
  createApiQuery<FlowConfiguration>(CONFIG.ENDPOINTS.CONFIGURATION_CONVERTER, ["configurationConverterTemplate"], {
    apiClientKey,
  });
