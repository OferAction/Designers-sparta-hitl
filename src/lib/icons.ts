/**
 * Central icon registry for custom SVG icons.
 *
 * Standard icons: import directly from "@phosphor-icons/react"
 * Custom icons: import from here — "@/lib/icons"
 *
 * All icons align with the Figma design system (GenSys Design System).
 */

// ─── Node Icons ───────────────────────────────────────────────────────────────
export { default as AggregatorIcon } from "@/assets/nodes/aggregatorIcon.svg?react";
export { default as ApiNodeIcon } from "@/assets/nodes/apiIcon.svg?react";
export { default as ClusterIcon } from "@/assets/nodes/cluster.svg?react";
export { default as CodeNodeIcon } from "@/assets/nodes/codeIcon.svg?react";
export { default as ConditionIcon } from "@/assets/nodes/condition.svg?react";
export { default as DataLoaderIcon } from "@/assets/nodes/dataLoader.svg?react";
export { default as DeduplicationIcon } from "@/assets/nodes/deduplicationIcon.svg?react";
export { default as EndNodeIcon } from "@/assets/nodes/endNodeIcon.svg?react";
export { default as FilterNodeIcon } from "@/assets/nodes/filter.svg?react";
export { default as GenOrModelIcon } from "@/assets/nodes/GenOrModel.svg?react";
export { default as IdentityNodeIcon } from "@/assets/nodes/identityIcon.svg?react";
export { default as LLMIcon } from "@/assets/nodes/LLM.svg?react";
export { default as LoopNodeIcon } from "@/assets/nodes/loop.svg?react";
export { default as OCRIcon } from "@/assets/nodes/OCR.svg?react";
export { default as OutlookIcon } from "@/assets/nodes/Outlook.svg?react";
export { default as RegexIcon } from "@/assets/nodes/regexIcon.svg?react";
export { default as SlackIcon } from "@/assets/nodes/Slack.svg?react";
export { default as SplitterNodeIcon } from "@/assets/nodes/SplitterIcon.svg?react";
export { default as StartNodeIcon } from "@/assets/nodes/startNodeIcon.svg?react";
export { default as SubflowIcon } from "@/assets/nodes/subflowIcon.svg?react";
export { default as ZoomIcon } from "@/assets/nodes/Zoom.svg?react";
// Catalog caret (used in node catalog lists — distinct from Phosphor CaretDownIcon)
export { default as NodeCatalogCaretDownIcon } from "@/assets/nodes/CaretDown.svg?react";

// ─── Input / Output Type Icons ────────────────────────────────────────────────
export { default as BooleanTypeIcon } from "@/assets/InputTagIcons/Boolean.svg?react";
export { default as FileTypeIcon } from "@/assets/InputTagIcons/File.svg?react";
export { default as DictionaryTypeIcon } from "@/assets/InputTagIcons/IconDictionary.svg?react";
export { default as ListTypeIcon } from "@/assets/InputTagIcons/List.svg?react";
export { default as ListOfFilesTypeIcon } from "@/assets/InputTagIcons/ListOfFiles.svg?react";
export { default as ListOfNumbersTypeIcon } from "@/assets/InputTagIcons/ListOfNumbers.svg?react";
export { default as ListOfObjectsTypeIcon } from "@/assets/InputTagIcons/ListOfObjects.svg?react";
export { default as ListOfStringsTypeIcon } from "@/assets/InputTagIcons/ListOfStrings.svg?react";
export { default as NumberTypeIcon } from "@/assets/InputTagIcons/Number.svg?react";
export { default as ObjectTypeIcon } from "@/assets/InputTagIcons/Object.svg?react";
export { default as PydanticTypeIcon } from "@/assets/InputTagIcons/Pydantic.svg?react";
export { default as StringTypeIcon } from "@/assets/InputTagIcons/String.svg?react";
export { default as AccuracyTypeIcon } from "@/assets/InputTagIcons/Accuracy.svg?react";

// ─── Brand / App Icons ────────────────────────────────────────────────────────
export { default as LogoDark } from "@/assets/actionhq-logo-dark.svg?react";
export { default as LogoLight } from "@/assets/actionhq-logo-light.svg?react";
export { default as GenOneIcon } from "@/assets/genOneIcon.svg?react";
export { default as GenOneGradientIcon } from "@/assets/genOneGradientIcon.svg?react";
export { default as GenOrLogoIcon } from "@/assets/genor_logo.svg?react";

// ─── Custom UI / Domain Icons ─────────────────────────────────────────────────
// Figma name: "Branch symbol"
export { default as BranchIcon } from "@/assets/branch.svg?react";
// Figma name: "ActionAI icon" (inline SVG component — import ActOneIcon from @/components/hq/ActOneIcon)
// Figma name: "Custom Rule funnel"
export { default as CustomRuleFunnelIcon } from "@/assets/CustomRuleFunnelIcon.svg?react";
// Figma name: "Nut global custom rule" / "Nut global agentic"
export { default as FunnelNutIcon } from "@/assets/FunnelNut.svg?react";
export { default as FunnelCodeNutIcon } from "@/assets/FunnelCodeNut.svg?react";
// Figma name: "Rule funnel"
export { default as RuleFunnelIcon } from "@/assets/Funnel.svg?react";
// Figma name: "Monitor Pulse"
export { default as MonitorPulseIcon } from "@/assets/MonitorPulse.svg?react";
// Cloud upload status
export { default as CloudArrowUpIcon } from "@/assets/CloudArrowUp.svg?react";
// Connector between evaluations
export { default as EvalConnectorIcon } from "@/assets/evalConnector.svg?react";
// Sorting arrows (table headers)
export { default as SortAscIcon } from "@/assets/sorting_up_arrow.svg?react";
export { default as SortDescIcon } from "@/assets/sorting_down_arrow.svg?react";
// Subset / partial selection
export { default as SubsetIcon } from "@/assets/SubsetIcon.svg?react";
// Table view
export { default as TableIcon } from "@/assets/TableIcon.svg?react";
// Trigger node
export { default as TriggerIcon } from "@/assets/Trigger.svg?react";
// Azure trigger
export { default as AzureTriggerIcon } from "@/assets/AzureTrigger.svg?react";
// Ground truth
export { default as GTIcon } from "@/assets/GT-Icon.svg?react";
export { default as GroundTruthIcon } from "@/assets/groundTruthIcon.svg?react";
// Workspace / file card
export { default as FileCardDefaultIcon } from "@/assets/file-card-default.svg?react";
export { default as FolderTopIcon } from "@/assets/folder-top.svg?react";
// Shield / admin
export { default as ShieldUserIcon } from "@/assets/ShieldUser.svg?react";
// Terminate / wireless / other flow controls
export { default as TerminateIcon } from "@/assets/terminateIcon.svg?react";
export { default as WirelessIcon } from "@/assets/wirlessIcon.svg?react";
// Repeat modes (tree-view)
export { default as RepeatOnceIcon } from "@/assets/RepeatOnce.svg?react";
export { default as RepeatTwiceIcon } from "@/assets/RepeatTwice.svg?react";
export { default as RepeatThreeIcon } from "@/assets/RepeatThree.svg?react";
// Slider vector handle
export { default as VectorIcon } from "@/assets/Vector.svg?react";
// Output/scan for add-node dropdown
export { default as OutputIcon } from "@/assets/output.svg?react";
export { default as ScanNodeIcon } from "@/assets/scan.svg?react";
export { default as ConfidenceIcon } from "@/assets/confidence.svg?react";
// Warning indicator (used on node status — distinct from Phosphor WarningIcon)
export { default as NodeWarningIcon } from "@/assets/Warning.svg?react";
// Analytics metrics
export { default as CoverageMetricIcon } from "@/assets/CoverageMetric.svg?react";
export { default as ExExMetricIcon } from "@/assets/ExExMetric.svg?react";
export { default as ErrorExExIcon } from "@/assets/ImportantExExSample.svg?react";
export { default as WarningExExIcon } from "@/assets/WarningExExSample.svg?react";
// Icon trailing (used in LLM details)
export { default as IconTrailingIcon } from "@/assets/Icon-Trailing.svg?react";
