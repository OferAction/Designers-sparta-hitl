import { Node as FlowNode } from "@xyflow/react";

import { NonNullableOption as Option } from "@/components/ui/input-tag";
import { DynamicFieldValue } from "@/modules/flow/components/IO";

export type Primitive = string | number | boolean;
export type List<T = unknown> = Array<T>;
export type Dictionary<T = unknown> = Record<string, T>;
export type NonPrimitive = List | Dictionary;

type DropdownOption = {
  label: string;
  value: string;
};

// Update RenderType to include connector
export type RenderType = "ifelse" | "iterator" | "agent" | "start" | "end" | "identity" | "aggregator" | "dataLoader" | "subflow" | "connector";

// Refactor AgentNodeType to explicitly use string from Primitive
export type AgentNode =
  | "regexBinaryClassifier"
  | "regexMultiLabelClassifier"
  | "regexMultiClassClassifier"
  | "regexClusteringAgent"
  | "ocrAgent"
  | "formattingAgent"
  | "mappingAgent"
  | "llmAgent"
  | "filterAgent"
  | "splitterAgent"
  | "deduplicationAgent"
  | "customCodeAgent"
  | "APIAgent"
  | "TrOCRAgent"
  | "VITClassifier"
  | "YOLOAgent"
  | "genOrModel";

// Refactor AgentNodeType to explicitly use string from Primitive
export type ConnectorNode = "outlook" | "slack" | "zoom";

// Refactor NonAgentNodeType to explicitly use string from Primitive
export type NonAgentNode = "start" | "end" | "ifelse" | "iterator" | "identity" | "aggregator" | "metadataProcessor" | "dataLoader" | "subflow";

export type NodeTypes = NonAgentNode | AgentNode | ConnectorNode;

export type NodeDisplayName =
  | "Start"
  | "End"
  | "User Input"
  | "If Else"
  | "Iterator"
  | "Aggregator"
  | "Data Loader"
  | "Metadata Processor"
  | "Regex Binary Classifier"
  | "Regex Multi Label Classifier"
  | "Regex Multi Class Classifier"
  | "Regex Clustering"
  | "OCR"
  | "Formatting Agent"
  | "Mapping Agent"
  | "LLM Agent"
  | "Splitter Agent"
  | "Deduplication Agent"
  | "Filter Agent"
  | "Custom Code Agent"
  | "API Agent"
  | "TrOCR Agent"
  | "VIT Classifier"
  | "Create Parameter"
  | "YOLO Agent"
  | "Action Models"
  | "Subflow"
  | "Outlook"
  | "Slack"
  | "Zoom";

export type NodeInputOutputType =
  | { type: "String"; value: string }
  | { type: "Number"; value: number }
  | { type: "Float"; value: number }
  | { type: "Integer"; value: number }
  | { type: "Dictionary"; value: Dictionary }
  | { type: "Boolean"; value: boolean }
  | { type: "Object"; value: object }
  | { type: "Any"; value: object }
  | { type: "List"; value: List }
  | { type: "List of Strings"; value: List<string> }
  | { type: "List of Numbers"; value: List<number> }
  | { type: "List of Booleans"; value: List<boolean> }
  | { type: "List of Objects"; value: List<object> }
  | { type: "List of Files"; value: List<File> }
  | { type: "File" }
  | { type: "Pydantic"; value: Dictionary }
  | { type: "Undefined" };

export interface NodeOutput extends NodeIOItem {
  sourceNodeId?: string;
  originalOutputId?: string;
  nodeId?: string;
}

// Ancestor value option type for UI components (extends NodeIOItem with UI-specific properties)
export interface AncestorValueOption extends NodeIOItem {
  label: string;
  value: string;
  keywords?: string[];
  icon?: React.ComponentType<{ className?: string }>;
  isReference?: boolean;
}

export type Message = {
  id: string;
  role: "image" | "user" | "assistant" | "system" | "files";
  content: DynamicFieldValue;
};

export type ModelParameters = {
  model: string;
  provider: string;
  hyperparameters?: {
    temperature?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    max_tokens?: number;
  };
};

// ResponseFormat is now an alias for NodeIOItem for consistency
export type ResponseFormat = NodeIOItem;

// export type NodeInput = NodeInputOutputBase & {
//   isReference: boolean;
//   render_type: string; //debt
//   language?: string;
//   options?: {
//     label: string;
//     value: string;
//   }[];
// };

type ConstantValue = {
  type: "constant";
  value: string;
};

type ReferenceValue = {
  type: "reference";
  value: string[]; // should start with node id for example: referencing node_1.outputs.metadata => ["node_1", "outputs", "metadata"]
};

type TemplateValue = {
  type: "template";
  parts: (ConstantValue | ReferenceValue)[];
};

type ObjectValue<T = unknown> = {
  id: string;
  type: "object";
  value: Dictionary<T>;
};

type InputValue = ConstantValue | ReferenceValue | TemplateValue | ObjectValue | null;

type BaseNodeInput<R extends string, D extends object = object> = {
  id: string;
  label: string;
  key?: string;
  description?: string;
  required?: boolean;
  render_type: R;
  value_type: NodeInputOutputType["type"];
  configType?: "call_kwargs" | "init_kwargs";
  value: InputValue;
} & D;

type DropdownNodeInput = BaseNodeInput<
  "dropdown",
  {
    options: DropdownOption[];
    selectedOptionIndex?: number;
  }
>;

export interface OCRProviderConfig {
  provider: string;
  api_key: string;
  endpoint_url: string;
  model_id: string;
  pages: string;
  reading_order: string;
  language?: string;
}

export interface OutlookProviderConfig {
  provider: string;
  api_key: string;
  endpoint_url: string;
  model_id: string;
  pages: string;
  reading_order: string;
  language?: string;
}

export interface SliderConfig {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue?: number;
  key: keyof ModelParameters["hyperparameters"];
}

export interface GenOrModelInputs {
  id: string;
  key: string;
  type: string;
  value: {
    label: string;
    value: string;
  };
  description?: string;
}

type CodeNodeInput = BaseNodeInput<
  "code",
  {
    language: string;
    value?: ConstantValue;
  }
>;

type InputTagInput = BaseNodeInput<
  "input-tag",
  {
    value?: Exclude<InputValue, TemplateValue>;
  }
>;

export type NodeInput = DropdownNodeInput | CodeNodeInput | InputTagInput; // TODO: add other input types like input tags etc..
export type ApiAgentType = {
  inputs: {
    url: string;
    method: "GET" | "POST" | "PUT" | "DELETE";
    headers?: NodeInputItem[];
    params?: NodeInputItem[];
    data?: string;
    language: string;
  };
};

export type DeduplicationAgentType = {
  inputs: {
    items: NodeInputItem;
    threshold: number;
    keep_one_duplicate: boolean;
  };
};
export type SplitterAgentType = {
  inputs: {
    pdf_url: NodeInputItem;
    dpi: number;
    output_format: string;
  };
};

export interface ConditionType {
  id: string;
  type: "if" | "elif" | "else";
  values: ConditionValues[];
  then: string[];
  /** Raw editor state (SerializedEditorState as JSON string) for restoring the condition editor */
  expression?: string;
}

export interface BaseConditionNodeData {
  conditions: ConditionType[];
}

export type ConditionValues = {
  value?: string;
  label?: string;
  type?: string;
  path?: string[];
  isReference?: boolean;
  id?: string;
};

export type FilterConditionPart = {
  value?: string;
  label?: string;
  type?: "function" | "operator" | string;
  isReference?: boolean;
  id?: string;
};

export interface FilterAgentData {
  inputs: {
    iterable: NodeInputItem;
    conditions: ConditionValues[];
    /** Raw editor state (SerializedEditorState as JSON string) for restoring the condition editor */
    expression?: string;
  };
}

export interface AgentNodeData {
  inputs: {
    model_parameters?: ModelParameters;
    system_prompt?: string;
    messages?: Message[];
  };
}

export interface OCRAgentType {
  inputs: {
    value: {
      label: string;
      value: string;
    };
    provider_config: OCRProviderConfig;
  };
}

export interface GenOrModelType {
  inputs: {
    model_inputs: GenOrModelInputs[];
    model_id: string;
    init_kwargs: string;
    call_kwargs: string;
  };
}

interface AggregatorOutput extends NodeOutput {
  children: ({ id: string } & Option)[];
}

export type AggregatorNodeData = {
  outputs: (NodeOutput & AggregatorOutput)[];
};

export type IteratorNodeData = {
  outputs: NodeOutput[];
  inputs: IteratorNodeInputs;
  variables: NodeOutput[];
};

export type NodeException = Exclude<RenderType, "ifelse">;

export type NodeData<T extends RenderType = RenderType, N extends NodeTypes = NodeTypes, D = object, O extends NodeOutput = NodeOutput> = {
  name: N;
  title: NodeDisplayName;
  subtitle?: string;
  description?: string;
  label?: string;
  type: T;
  inputs: unknown;
  outputs: O[];
  after_node_execution: AfterNodeExecutionAction;
  rules?: NodeRulesConfig;
  save_result?: boolean;
  sourceHandleConnected?: Record<string, number>;
  targetHandleConnected?: Record<string, number>;
  routeHandles?: string[];
  [key: string]: unknown;
} & D;

export type BaseNode<T extends RenderType = RenderType, N extends NodeTypes = NodeTypes, D = object, O extends NodeOutput = NodeOutput> = FlowNode<
  NodeData<T, N, D, O>,
  T
>;

export type StartNodeTrigger = {
  id: string;
  account: string;
  repeats: number;
  hasAttachment?: boolean;
  sender: string[];
  eventTime: string;
  type: number;
  settings: Record<string, unknown>;
};

export type StartNodeData = {
  inputs: NodeInputItem[];
  triggers: StartNodeTrigger[];
};
export type EndNodeData = {
  inputs: NodeInputItem[];
};

export type SubflowInputs = SubflowData["inputs"][number];

export type DataLoaderData = {
  inputs: DataLoaderInputs[];
};
export interface DataLoaderInputs {
  id: string;
  key: string;
  type: {
    label: "File";
    value: "File";
  };
  value: {
    label: string;
    value: string;
  };
}
export type IdentityNodeData = {
  inputs: NodeInputItem[];
};

export interface NodeIOItem {
  id: string;
  key: string;
  type: string;
  description?: string;
  required?: boolean;
  readOnly?: boolean; // For predefined inputs that can't be edited
  parentId?: string;
  childrenIds?: string[];
  RuleId?: string;
  RuleName?: string;
  parentNodeType?: string; // Source node type when referencing a Pydantic output (e.g. "start", "customCodeAgent")
}

export interface NodeInputItem extends NodeIOItem {
  value: {
    label: string;
    value: string;
    isReference?: boolean;
  };
}

export type CustomCodeAgentNodeData = {
  inputs: {
    input_vars: NodeInputItem[];
    code: string;
    language: string;
    dependencies: string[];
  };
};
export interface RegexBinaryClassifierInput {
  data: string;
  regex_patterns: regexItem[];
  unwanted_regex_patterns?: regexItem[];
  relevant_match?: string;
  context_range?: number;
}

export interface RegexBinaryClassifierInputs {
  inputs: RegexBinaryClassifierInput;
}

export interface RegexClass {
  id: string;
  key: string;
  order: number;
  regex_patterns: regexItem[];
  unwanted_regex_patterns?: regexItem[];
  relevant_match?: string;
  context_range?: number;
  flags?: string;
}

export interface RegexMultiClassClassifierInput {
  iterable: NodeInputItem;
  classes: RegexClass[];
}

export interface RegexMultiClassClassifierInputs {
  inputs: RegexMultiClassClassifierInput;
}

export type regexItem = {
  id: string;
  value: string;
};

export interface RegexClusteringInput {
  iterable: NodeInputItem;
  classes: RegexClass[];
}

export interface RegexClusteringInputs {
  inputs: RegexClusteringInput;
}

export interface IteratorNodeInputs {
  iterable: Option | null;
  exit_condition?: Option[];
  max_iterations?: number;
  type: "for" | "while";
}

export type SubflowData = {
  type: "subflow";
  subflowConfigId: string;
  subflowId: string;
  inputs: NodeInputItem[];
};

export type OutlookNodeData = {
  connectorId: string;
  inputs: OutlookNodeInputs;
};

interface BaseOutlookInput {
  id: string;
  description?: string;
  value: {
    label: string;
  };
}

// Individual input types
export interface OutlookSubjectInput extends BaseOutlookInput {
  key: "subject";
  type: "String";
  value: {
    label: string;
    value: string;
  };
}

export interface OutlookBodyInput extends BaseOutlookInput {
  key: "body";
  type: "String";
  value: {
    label: string;
    value: string;
  };
}

export interface OutlookToInput extends BaseOutlookInput {
  key: "to";
  type: "List of Strings";
  value: {
    label: string;
    value: string[];
  };
}

export interface OutlookToNameInput extends BaseOutlookInput {
  key: "toName";
  type: "List of Strings";
  value: {
    label: string;
    value: string[];
  };
}

export interface OutlookCcInput extends BaseOutlookInput {
  key: "cc";
  type: "List of Strings";
  value: {
    label: string;
    value: string[];
  };
}

export interface OutlookBccInput extends BaseOutlookInput {
  key: "bcc";
  type: "List of Strings";
  value: {
    label: string;
    value: string[];
  };
}

export interface OutlookAttachmentsInput extends BaseOutlookInput {
  key: "attachments";
  type: "List of Strings";
  value: {
    label: string;
    value: string[];
  };
}

export interface OutlookReferencedAttachmentsInput extends BaseOutlookInput {
  key: "referencedAttachments";
  type: "List of Strings";
  value: {
    label: string;
    value: string[];
    readonly isReference: true;
  };
}

export interface OutlookSendDateInput extends BaseOutlookInput {
  key: "sendDate";
  type: "String";
  value: {
    label: string;
    value: string;
  };
}

export interface OutlookSendTimeInput extends BaseOutlookInput {
  key: "sendTime";
  type: "String";
  value: {
    label: string;
    value: string;
  };
}

export interface OutlookSignatureInput extends BaseOutlookInput {
  key: "outlookSignature";
  type: "Boolean";
  value: {
    label: string;
    value: boolean;
  };
}

export interface OutlookActionInput extends BaseOutlookInput {
  key: "action";
  type: "String";
  value: {
    label: string;
    value: string;
  };
}

export interface OutlookFoldersInput extends BaseOutlookInput {
  key: "folders";
  type: "List of Strings";
  value: {
    label: string;
    value: string[];
  };
}

export interface OutlookSenderEmailsInput extends BaseOutlookInput {
  key: "from";
  type: "List of Strings";
  value: {
    label: string;
    value: string[];
  };
}

export interface OutlookSubjectContainsInput extends BaseOutlookInput {
  key: "subjectContains";
  type: "String";
  value: {
    label: string;
    value: string;
  };
}

// Advanced GET parameters as individual inputs
export interface OutlookMessageStatusInput extends BaseOutlookInput {
  key: "messageStatus";
  type: "String";
  value: {
    label: string;
    value: "all" | "read" | "unread";
  };
}

export interface OutlookDateFromInput extends BaseOutlookInput {
  key: "dateFrom";
  type: "String";
  value: {
    label: string;
    value: string;
  };
}

export interface OutlookDateToInput extends BaseOutlookInput {
  key: "dateTo";
  type: "String";
  value: {
    label: string;
    value: string;
  };
}

export interface OutlookFilterToInput extends BaseOutlookInput {
  key: "filterTo";
  type: "String";
  value: {
    label: string;
    value: string;
  };
}

export interface OutlookBodyContainsInput extends BaseOutlookInput {
  key: "bodyContains";
  type: "String";
  value: {
    label: string;
    value: string;
  };
}

export interface OutlookHasAttachmentsInput extends BaseOutlookInput {
  key: "hasAttachments";
  type: "String";
  value: {
    label: string;
    value: "Both" | "Yes" | "No";
  };
}

export interface OutlookAllowedFileTypesInput extends BaseOutlookInput {
  key: "allowedFileTypes";
  type: "String";
  value: {
    label: string;
    value: string;
  };
}

export interface OutlookMinSizeMBInput extends BaseOutlookInput {
  key: "minSizeMB";
  type: "Number";
  value: {
    label: string;
    value: number | "";
  };
}

export interface OutlookMaxSizeMBInput extends BaseOutlookInput {
  key: "maxSizeMB";
  type: "Number";
  value: {
    label: string;
    value: number | "";
  };
}

export interface OutlookMaxEmailsToReturnInput extends BaseOutlookInput {
  key: "maxEmailsToReturn";
  type: "Integer";
  value: {
    label: string;
    value: number;
  };
}

export interface OutlookIncludeSubfoldersInput extends BaseOutlookInput {
  key: "includeSubfolders";
  type: "Boolean";
  value: {
    label: string;
    value: boolean;
  };
}

export interface OutlookMarkAsReadAfterProcessingInput extends BaseOutlookInput {
  key: "markAsReadAfterProcessing";
  type: "Boolean";
  value: {
    label: string;
    value: boolean;
  };
}
export interface outlookUserIdInput extends BaseOutlookInput {
  key: "userId";
  type: "String";
  value: {
    label: string;
    value: string;
  };
}

// Union type for all inputs
export type OutlookInputType =
  | OutlookSubjectInput
  | OutlookBodyInput
  | OutlookToInput
  | OutlookToNameInput
  | OutlookCcInput
  | OutlookBccInput
  | OutlookAttachmentsInput
  | OutlookReferencedAttachmentsInput
  | OutlookSendDateInput
  | OutlookSendTimeInput
  | OutlookSignatureInput
  | OutlookActionInput
  | OutlookFoldersInput
  | OutlookSenderEmailsInput
  | OutlookSubjectContainsInput
  | outlookUserIdInput
  // Advanced GET
  | OutlookMessageStatusInput
  | OutlookDateFromInput
  | OutlookDateToInput
  | OutlookFilterToInput
  | OutlookBodyContainsInput
  | OutlookHasAttachmentsInput
  | OutlookAllowedFileTypesInput
  | OutlookMinSizeMBInput
  | OutlookMaxSizeMBInput
  | OutlookMaxEmailsToReturnInput
  | OutlookIncludeSubfoldersInput
  | OutlookMarkAsReadAfterProcessingInput;

export type OutlookNodeInputs = OutlookInputType[];

export type Node =
  | BaseNode<"end", "end", EndNodeData>
  | BaseNode<"subflow", "subflow", SubflowData>
  | BaseNode<"start", "start", StartNodeData>
  | BaseNode<"ifelse", "ifelse", BaseConditionNodeData>
  | BaseNode<"iterator", "iterator", IteratorNodeData>
  | BaseNode<"dataLoader", "dataLoader", DataLoaderData>
  | BaseNode<"aggregator", "aggregator", object, AggregatorOutput>
  | BaseNode<"identity", "identity", IdentityNodeData>
  | BaseNode<"agent", "customCodeAgent", CustomCodeAgentNodeData>
  | BaseNode<"agent", "regexBinaryClassifier", RegexBinaryClassifierInputs>
  | BaseNode<"agent", "regexMultiClassClassifier", RegexMultiClassClassifierInputs>
  | BaseNode<"agent", "regexClusteringAgent", RegexClusteringInputs>
  | BaseNode<"agent", "APIAgent", ApiAgentType>
  | BaseNode<"agent", "llmAgent", AgentNodeData>
  | BaseNode<"agent", "deduplicationAgent", DeduplicationAgentType>
  | BaseNode<"agent", "ocrAgent", OCRAgentType>
  | BaseNode<"agent", "genOrModel", GenOrModelType>
  | BaseNode<"agent", "splitterAgent", SplitterAgentType>
  | BaseNode<"agent", "filterAgent", FilterAgentData>
  | BaseNode<"agent", AgentNode>
  | BaseNode<"connector", "outlook", OutlookNodeData>
  | BaseNode<"connector", ConnectorNode>;

export interface NodeRulesConfig {
  route_on_system_rules?: string;
  isDefault?: boolean;
  non_system_rules?: RuleEntry[];
}

export type BuiltInRuleAction = "route" | "continue" | "terminate";
export type AfterNodeExecutionAction = "stop" | "continue" | "terminate";
export type custom_rule_type = "code-agent" | "subflow";

export interface RuleSetting {
  key: string;
  type: string;
  value?: { label: string; value: string };
  isReference?: boolean;
}

export interface RuleVars {
  key: string;
  type: string;
  value?: { label: string; value: string };
  isReference?: boolean;
}

export interface CustomRulesLogic {
  input_vars: RuleVars[];
  code: string;
  dependencies?: string[];
  language: string;
}

export interface RuleEntry {
  id: string;
  name?: string;
  type: "built-in" | "custom";
  action_on_execution: BuiltInRuleAction;
  terminate_on_fail?: boolean;
  enabled?: boolean;
  settings?: RuleSetting[];
  logic?: CustomRulesLogic;
  custom_rule_type?: custom_rule_type;
  route?: string;
  isDefault?: boolean;
  order?: number;
  focus?: boolean;
}

export type FlowConfiguration = Partial<{
  [K in NodeTypes]: K extends AgentNode
    ? Omit<Extract<Node, BaseNode<"agent", K>>, "position" | "draggable" | "selectable" | "selected">
    : K extends ConnectorNode
      ? Omit<BaseNode<"connector", K>, "position" | "draggable" | "selectable" | "selected">
      : Omit<Extract<Node, BaseNode<RenderType, K>>, "position" | "draggable" | "selectable" | "selected">;
}>;

export type NodeVariant<T extends RenderType = RenderType, N extends NodeTypes = NodeTypes> = Extract<Node, BaseNode<T, N>>;

export type NodeVariantData<T extends RenderType = RenderType, N extends NodeTypes = NodeTypes> = Pick<NodeVariant<T, N>, "id" | "type" | "data">;
