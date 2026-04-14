import { FC, SVGProps } from "react";

import { OutputIcon as Output, ScanNodeIcon as Scan } from "@/lib/icons";
import { NodeIconsMapping } from "@/constants";

type MenuItem = {
  type?: "item";
  label: string;
  icon: FC<SVGProps<SVGSVGElement>>;
  shortcut?: string;
  disabled?: boolean;
  value: string;
};

type MenuGroup = {
  type: "group";
  label: string;
  items: MenuData[];
};

type MenuSub = {
  type: "sub";
  icon: FC<SVGProps<SVGSVGElement>>;
  label: string;
  items: MenuData[];
};

export type MenuData = MenuItem | MenuGroup | MenuSub;

export const menuData: MenuData[] = [
  {
    type: "group",
    label: "AGENTS",
    items: [
      {
        type: "sub",
        label: "Processing Agents",
        icon: Scan,
        items: [
          { icon: NodeIconsMapping["ocrAgent"], label: "OCR", value: "ocrAgent" },
          { icon: NodeIconsMapping["llmAgent"], label: "LLM Agent", value: "llmAgent" },
          {
            value: "customCodeAgent",
            icon: NodeIconsMapping["customCodeAgent"],
            label: "Custom Code Agent",
          },
          {
            value: "formattingAgent",
            icon: NodeIconsMapping["formattingAgent"],
            label: "Formatting Agent",
          },
          {
            value: "mappingAgent",
            icon: NodeIconsMapping["mappingAgent"],
            label: "Mapping Agent",
          },
          {
            value: "genOrModel",
            icon: NodeIconsMapping["genOrModel"],
            label: "Action Models",
          },
          {
            value: "identity",
            icon: NodeIconsMapping["identity"],
            label: "Identity Agent",
          },
          {
            value: "dataLoader",
            icon: NodeIconsMapping["dataLoader"],
            label: "Data Loader Agent",
          },
          {
            value: "splitterAgent",
            icon: NodeIconsMapping["splitterAgent"],
            label: "Splitter Agent",
          },
          {
            value: "deduplicationAgent",
            icon: NodeIconsMapping["deduplicationAgent"],
            label: "Deduplication Agent",
          },
        ],
      },
      {
        type: "sub",
        label: "Specialized Agents",
        icon: Output,
        items: [
          {
            value: "YOLOAgent",
            icon: NodeIconsMapping["YOLOAgent"],
            label: "YOLO Agent",
          },
          {
            value: "APIAgent",
            icon: NodeIconsMapping["APIAgent"],
            label: "API Agent",
          },
          {
            value: "TrOCRAgent",
            icon: NodeIconsMapping["TrOCRAgent"],
            label: "TrOCR Agent",
          },
        ],
      },
    ],
  },
  {
    type: "group",
    label: "CLASSIFIERS",
    items: [
      {
        type: "sub",
        label: "Classifier Types",
        icon: Scan,
        items: [
          {
            value: "regexBinaryClassifier",
            icon: NodeIconsMapping["regexBinaryClassifier"],
            label: "Regex Binary Classifier",
          },
          {
            value: "regexMultiLabelClassifier",
            icon: NodeIconsMapping["regexMultiLabelClassifier"],
            label: "Regex Multi Label Classifier",
          },
          {
            value: "regexMultiClassClassifier",
            icon: NodeIconsMapping["regexMultiClassClassifier"],
            label: "Regex Multi Class Classifier",
          },
          {
            value: "regexClusteringAgent",
            icon: NodeIconsMapping["regexClusteringAgent"],
            label: "Regex Clustering Agent",
          },
          {
            value: "VITClassifier",
            icon: NodeIconsMapping["VITClassifier"],
            label: "VIT Classifier",
          },
        ],
      },
    ],
  },
  {
    type: "group",
    label: "OPERATORS",
    items: [
      {
        value: "iterator",
        icon: NodeIconsMapping["iterator"],
        label: "Iteration",
      },
      {
        value: "aggregator",
        icon: NodeIconsMapping["aggregator"],
        label: "Aggregator",
      },
      {
        value: "ifelse",
        icon: NodeIconsMapping["ifelse"],
        label: "If Else",
      },
    ],
  },
];
