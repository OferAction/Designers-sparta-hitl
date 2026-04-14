import { GearIcon } from "@phosphor-icons/react";

import { useSystemRulesConfiguration } from "@/modules/flow/hooks/useSystemRulesConfiguration";

import { getDefaultExceptionMessage } from "./constants";
import { AgenticRulesTab } from "./RulesConfigurationTabs/AgenticRulesTab";
import { CustomRulesTab } from "./RulesConfigurationTabs/CustomRulesTab";
import { SystemRulesTab } from "./RulesConfigurationTabs/SystemRulesTab";
import { CustomRuleFunnelIcon, GenOrModelIcon as AgenticRulesIcon } from "@/lib/icons";
import { ConfigurationMenu } from "@/components/ui/configuration-menu.tsx";
import { useFlowStore } from "@/store";

export function SystemRulesConfiguration() {
  const leftPanelActiveItem = useFlowStore((s) => s.leftPanelActiveItem);
  const setLeftPanelActiveItem = useFlowStore((s) => s.setLeftPanelActiveItem);
  const derivedOpen = leftPanelActiveItem === "systemRules";
  const { active, setActive } = useSystemRulesConfiguration();

  return (
    <ConfigurationMenu
      defaultMessage={getDefaultExceptionMessage()}
      open={derivedOpen}
      onOpenChange={(next) => {
        if (!next && leftPanelActiveItem === "systemRules") {
          setLeftPanelActiveItem(null);
        }
      }}
      title="Exception rules configuration"
      navItems={[
        { id: "system", label: "System rules", icon: <GearIcon className="size-4" /> },
        { id: "agentic", label: "Agentic rules", icon: <AgenticRulesIcon className="size-4" /> },
        { id: "custom", label: "Custom rules", icon: <CustomRuleFunnelIcon className="size-4" /> },
      ]}
      activeId={active}
      onNavChange={(id) => setActive(id as "system" | "agentic" | "custom")}
    >
      {(() => {
        switch (active) {
          case "system":
            return <SystemRulesTab />;
          case "agentic":
            return <AgenticRulesTab />;
          case "custom":
            return <CustomRulesTab />;
          default:
            return null;
        }
      })()}
    </ConfigurationMenu>
  );
}
