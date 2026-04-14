export interface AgentInfo {
  id: string;
  name: string;
  templateId: string;
  description?: string;
  createdTime?: string;
  updateTime?: string;
  isDeleted?: boolean;
}

export interface AgentTemplateVersionInfo {
  id: string;
  major: number;
  minor: number;
  patch: number;
  timestamp: string;
}

export interface AgentTemplateIO {
  key: string;
  type: string;
  description?: string;
  required?: boolean;
}

export interface BuiltInRuleInputField {
  FieldName: string;
  FieldType: string;
}

export interface BuiltInRuleOutputSpec {
  Key: string;
  Type: string;
  Description?: string;
  Children?: BuiltInRuleOutputSpec[];
}

export interface TemplateBuiltInRule {
  Id: string;
  RuleName: string;
  InputFields: BuiltInRuleInputField[];
  Outputs: BuiltInRuleOutputSpec[];
}

export interface AgentTemplate {
  id: string;
  name: string;
  task?: string;
  requiredInputsNumber?: number;
  inputs: AgentTemplateIO[];
  outputs: AgentTemplateIO[];
  template?: string;
  agentId: string;
  version: AgentTemplateVersionInfo;
  systemRules: unknown[];
  builtInRules: TemplateBuiltInRule[];
  createdTime?: string;
  updateTime?: string;
  isDeleted?: boolean;
  modelPath?: string;
  modelType?: string;
  modelProvider?: string;
}

export interface AgentWithTemplate {
  agent: AgentInfo;
  agentTemplate: AgentTemplate;
}
