export const SYSTEM_EXCEPTION_VARIABLES = [
  {
    label: "System Exception Variables",
    value: "system_exception_variables",
    children: [
      {
        id: "$message",
        key: "$message",
        label: "message",
        value: "$message",
        type: "String",
        isReference: true,
        description: "Exception message from the workflow",
      },
      {
        id: "$additional",
        key: "$additional",
        label: "additional",
        value: "$additional",
        type: "Object",
        isReference: true,
        description: "Additional exception details",
      },
      {
        id: "$rule_type",
        key: "$rule_type",
        label: "rule_type",
        value: "$rule_type",
        type: "String",
        isReference: true,
        description: "Type of rule that triggered the exception",
      },
      {
        id: "$failed_node_name",
        key: "$failed_node_name",
        label: "failed_node_name",
        value: "$failed_node_name",
        type: "String",
        isReference: true,
        description: "Name of the node where the exception occurred",
      },
    ],
  },
];

export function getDefaultExceptionMessage(orchestrationName: string = "orchestration") {
  return `An exception was triggered in the "${orchestrationName}" workflow with the following message: {{$message}} \n Failed Rule Type: {{$rule_type}} \n Failed Node: {{$failed_node_name}} \n Additional Information: {{$additional}}`;
}
