import type { ConnectorNode } from "@/modules/flow/types";

export type ConnectorTemplate = { name: ConnectorNode; title: string };

export type RuleType = "system" | "agentic" | "custom";
