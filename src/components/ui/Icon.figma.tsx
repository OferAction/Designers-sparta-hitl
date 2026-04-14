/**
 * Figma Code Connect — Icons
 *
 * ## Phosphor Icons (standard library)
 * All standard icons in the design system come from Phosphor.
 * Naming convention: Figma icon name + "Icon" suffix.
 *
 *   Figma "Bell"       → import { BellIcon } from "@phosphor-icons/react"
 *   Figma "CaretRight" → import { CaretRightIcon } from "@phosphor-icons/react"
 *   Figma "ArrowDown"  → import { ArrowDownIcon } from "@phosphor-icons/react"
 *
 *   <BellIcon size={16} />              (regular weight, default)
 *   <BellIcon size={16} weight="fill" />
 *
 * ## Custom Icons (product-specific)
 * Icons not in Phosphor — imported from "@/lib/icons".
 * Code Connect mappings below cover each custom icon.
 */

import figma from "@figma/code-connect"

import ActOneIcon from "@/hq/components/ActOneIcon"
import {
  BranchIcon,
  ConfidenceIcon,
  CustomRuleFunnelIcon,
  FunnelCodeNutIcon,
  FunnelNutIcon,
  MonitorPulseIcon,
  NodeWarningIcon,
  RepeatOnceIcon,
  RepeatThreeIcon,
  RepeatTwiceIcon,
  RuleFunnelIcon,
  ShieldUserIcon,
  TriggerIcon,
} from "@/lib/icons"

figma.connect(ActOneIcon, "https://www.figma.com/design/g5zl2u6IO13h5kcwBiQtOR?node-id=10101%3A13469", {
  example: () => <ActOneIcon size={16} />,
})

figma.connect(BranchIcon, "https://www.figma.com/design/g5zl2u6IO13h5kcwBiQtOR?node-id=16533%3A21930", {
  example: () => <BranchIcon className="size-4" />,
})

figma.connect(CustomRuleFunnelIcon, "https://www.figma.com/design/g5zl2u6IO13h5kcwBiQtOR?node-id=12126%3A37817", {
  example: () => <CustomRuleFunnelIcon className="size-4" />,
})

figma.connect(RuleFunnelIcon, "https://www.figma.com/design/g5zl2u6IO13h5kcwBiQtOR?node-id=12134%3A82049", {
  example: () => <RuleFunnelIcon className="size-4" />,
})

figma.connect(MonitorPulseIcon, "https://www.figma.com/design/g5zl2u6IO13h5kcwBiQtOR?node-id=14001%3A29571", {
  example: () => <MonitorPulseIcon className="size-4" />,
})

figma.connect(FunnelNutIcon, "https://www.figma.com/design/g5zl2u6IO13h5kcwBiQtOR?node-id=12134%3A81974", {
  example: () => <FunnelNutIcon className="size-4" />,
})

figma.connect(FunnelCodeNutIcon, "https://www.figma.com/design/g5zl2u6IO13h5kcwBiQtOR?node-id=15992%3A16974", {
  example: () => <FunnelCodeNutIcon className="size-4" />,
})

figma.connect(ConfidenceIcon, "https://www.figma.com/design/g5zl2u6IO13h5kcwBiQtOR?node-id=15797%3A6184", {
  example: () => <ConfidenceIcon className="size-4" />,
})

figma.connect(NodeWarningIcon, "https://www.figma.com/design/g5zl2u6IO13h5kcwBiQtOR?node-id=15931%3A14644", {
  example: () => <NodeWarningIcon className="size-4" />,
})

figma.connect(ShieldUserIcon, "https://www.figma.com/design/g5zl2u6IO13h5kcwBiQtOR?node-id=15840%3A12118", {
  example: () => <ShieldUserIcon className="size-4" />,
})

figma.connect(TriggerIcon, "https://www.figma.com/design/g5zl2u6IO13h5kcwBiQtOR?node-id=12378%3A9366", {
  example: () => <TriggerIcon className="size-4" />,
})

figma.connect(RepeatOnceIcon, "https://www.figma.com/design/g5zl2u6IO13h5kcwBiQtOR?node-id=6708%3A35498", {
  example: () => <RepeatOnceIcon className="size-4" />,
})

figma.connect(RepeatTwiceIcon, "https://www.figma.com/design/g5zl2u6IO13h5kcwBiQtOR?node-id=11841%3A64108", {
  example: () => <RepeatTwiceIcon className="size-4" />,
})

figma.connect(RepeatThreeIcon, "https://www.figma.com/design/g5zl2u6IO13h5kcwBiQtOR?node-id=11841%3A64134", {
  example: () => <RepeatThreeIcon className="size-4" />,
})
