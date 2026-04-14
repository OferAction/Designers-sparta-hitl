import { useCallback, useState, useEffect } from "react";

import type { RuleEntry } from "@/modules/flow/types/BaseNodeTypes";

import {
  writeRuleConfigToClipboard,
  readRuleConfigFromClipboard,
  hasValidRuleConfigInClipboard,
  ruleClipboardToasts,
  type ClipboardRuleData,
} from "@/utils/ruleClipboard";

export const useCopyPasteRule = () => {
  const [hasClipboardData, setHasClipboardData] = useState(false);

  // Check clipboard state
  useEffect(() => {
    const checkClipboard = () => {
      hasValidRuleConfigInClipboard().then(setHasClipboardData);
    };

    // Check immediately
    checkClipboard();

    // Re-check on clipboard events
    document.addEventListener("copy", checkClipboard);
    document.addEventListener("cut", checkClipboard);
    document.addEventListener("paste", checkClipboard);

    // Re-check when window gains focus
    window.addEventListener("focus", checkClipboard);

    return () => {
      document.removeEventListener("copy", checkClipboard);
      document.removeEventListener("cut", checkClipboard);
      document.removeEventListener("paste", checkClipboard);
      window.removeEventListener("focus", checkClipboard);
    };
  }, []);

  const copyRuleConfig = useCallback(async (rule: RuleEntry) => {
    const config: Partial<RuleEntry> = {
      action_on_execution: rule.action_on_execution,
      terminate_on_fail: rule.terminate_on_fail,
      settings: rule.settings,
      enabled: rule.enabled,
      // Don't copy: id, name, order, focus, route, isDefault, handleId
    };

    const data: ClipboardRuleData = {
      type: rule.type,
      config,
    };

    const success = await writeRuleConfigToClipboard(data);
    if (success) {
      ruleClipboardToasts.copySuccess();
      setHasClipboardData(true);
    }
  }, []);

  const pasteRuleConfig = useCallback(
    async (
      targetRule: RuleEntry,
      onUpdate: (id: string, patch: Partial<RuleEntry>) => void,
      validateRoute?: (route: string | undefined, isDefault: boolean | undefined) => boolean
    ): Promise<boolean> => {
      const clipboardData = await readRuleConfigFromClipboard();

      if (!clipboardData) {
        ruleClipboardToasts.pasteEmpty();
        return false;
      }

      // Check type compatibility
      if (clipboardData.type !== targetRule.type) {
        ruleClipboardToasts.pasteTypeMismatch();
        return false;
      }

      // Validate route if a validator is provided
      const config = { ...clipboardData.config };
      if (validateRoute && config.route !== undefined) {
        const routeExists = validateRoute(config.route, config.isDefault);
        if (!routeExists) {
          // Remove route and isDefault if route doesn't exist
          delete config.route;
          delete config.isDefault;
        }
      }

      // Apply the configuration
      onUpdate(targetRule.id, config);
      ruleClipboardToasts.pasteSuccess();
      return true;
    },
    []
  );

  return {
    copyRuleConfig,
    pasteRuleConfig,
    hasClipboardData,
  };
};
