// Node type to display name mapping
const NODE_TYPE_LABELS: Record<string, string> = {
  ocrAgent: "OCR",
  llmAgent: "LLM",
  filterAgent: "Filter",
  deduplicationAgent: "Deduplication",
  customCodeAgent: "Code",
  formattingAgent: "Format",
  mappingAgent: "Map",
  APIAgent: "API",
  regexBinaryClassifier: "Regex Binary",
  regexMultiLabelClassifier: "Regex Multi Label",
  regexMultiClassClassifier: "Regex Multi Class",
  regexClusteringAgent: "Regex Clustering",
  TrOCRAgent: "TrOCR",
  VITClassifier: "VIT",
  YOLOAgent: "YOLO",
  genOrModel: "Action Models",
  identity: "Create Parameter",
  splitterAgent: "Splitter",
  dataLoader: "DataLoader",
  aggregator: "Aggregator",
  iterator: "Iterator",
  ifelse: "If Else",
  subflow: "Subflow",
  connector: "Connector",
  outlook: "Outlook",
  slack: "Slack",
  zoom: "Zoom",
};

/**
 * Service for generating numbered labels for nodes
 * Tracks the last used index for each node type
 */
class NodeLabelService {
  private typeCounters: Record<string, number> = {};

  /**
   * Gets the display label for a node type
   */
  getNodeTypeLabel(nodeType: string): string {
    return NODE_TYPE_LABELS[nodeType] || nodeType;
  }

  /**
   * Generates the next numbered label for a node type
   */
  generateNextLabel(nodeType: string): string {
    const baseLabel = this.getNodeTypeLabel(nodeType);

    // Increment the counter for this node type
    this.typeCounters[nodeType] = (this.typeCounters[nodeType] || 0) + 1;

    return `${baseLabel} ${this.typeCounters[nodeType]}`;
  }

  /**
   * Resets the counter for a specific node type
   */
  resetCounter(nodeType: string): void {
    delete this.typeCounters[nodeType];
  }

  /**
   * Resets all counters
   */
  resetAllCounters(): void {
    this.typeCounters = {};
  }

  /**
   * Gets the current counter value for a node type
   */
  getCurrentCounter(nodeType: string): number {
    return this.typeCounters[nodeType] || 0;
  }

  /**
   * Syncs counters with existing nodes (useful when loading configurations)
   */
  syncWithExistingNodes(nodes: any[]): void {
    // Reset all counters first
    this.resetAllCounters();

    // Count existing nodes by type
    const nodeTypeCounts: Record<string, number> = {};

    nodes.forEach((node) => {
      const nodeType = node.type || node.data?.name || node.data?.type;
      if (nodeType && nodeType !== "start" && nodeType !== "end") {
        const baseLabel = this.getNodeTypeLabel(nodeType);
        const label = node.data?.label || node.label || "";

        // Check if the label matches our pattern (e.g., "OCR 1", "LLM 2")
        const match = label.match(new RegExp(`^${baseLabel}\\s*(\\d+)$`));
        if (match) {
          const number = parseInt(match[1], 10);
          nodeTypeCounts[nodeType] = Math.max(nodeTypeCounts[nodeType] || 0, number);
        }
      }
    });

    // Set counters to the highest found number for each type
    Object.entries(nodeTypeCounts).forEach(([nodeType, maxNumber]) => {
      this.typeCounters[nodeType] = maxNumber;
    });
  }
}

// Export singleton instance
export const nodeLabelService = new NodeLabelService();
