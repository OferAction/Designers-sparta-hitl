import { useMemo } from "react";

import { useHotkeys, type HotkeyCallback, type Options } from "react-hotkeys-hook";

import { useCheckCanvasPermission, type CanvasInteractionPermissions } from "@/store/slices/flowSlice";

import { DEFAULT_SHORTCUT_SETTINGS } from "@/constants/KeyboardShortcuts";

export interface ShortcutOptions extends Partial<Options> {
  readonly permissionKey?: keyof CanvasInteractionPermissions;
}

export interface ShortcutDefinition {
  readonly id?: string;
  readonly keys: string | string[];
  readonly handler: HotkeyCallback;
  readonly options?: ShortcutOptions;
}

interface ShortcutProps {
  readonly shortcuts: readonly ShortcutDefinition[];
  readonly sharedOptions?: ShortcutOptions;
}

interface ShortcutHandlerProps {
  readonly keys: string | string[];
  readonly handler: HotkeyCallback;
  readonly sharedOptions?: ShortcutOptions;
  readonly options?: ShortcutOptions;
}

const ShortcutHandler = ({ keys, handler, sharedOptions, options }: ShortcutHandlerProps) => {
  const checkCanvasPermission = useCheckCanvasPermission();

  const mergedOptions = useMemo<Options>(() => {
    const { permissionKey: sharedPermissionKey, ...sharedHotkeyOptions } = sharedOptions || {};
    const { permissionKey, ...localOptions } = options || {};

    const baseOptions: Options = {
      ...DEFAULT_SHORTCUT_SETTINGS,
      ...sharedHotkeyOptions,
      ...localOptions,
    };

    const effectivePermissionKey = permissionKey ?? sharedPermissionKey;

    if (effectivePermissionKey) {
      return {
        ...baseOptions,
        enabled: checkCanvasPermission(effectivePermissionKey),
      };
    }

    return {
      ...baseOptions,
      enabled: baseOptions.enabled ?? true,
    };
  }, [checkCanvasPermission, options, sharedOptions]);

  // Register hotkey and ensure options merge happens only when dependencies change.
  useHotkeys(keys, handler, mergedOptions);

  return null;
};

const Shortcut = ({ shortcuts, sharedOptions }: ShortcutProps) => {
  if (!shortcuts.length) {
    return null;
  }

  return (
    <>
      {shortcuts.map(({ id, keys, handler, options }, index) => (
        <ShortcutHandler key={id ?? index} keys={keys} handler={handler} sharedOptions={sharedOptions} options={options} />
      ))}
    </>
  );
};

export default Shortcut;
