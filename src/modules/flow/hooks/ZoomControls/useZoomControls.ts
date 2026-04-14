import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";

import { useOnViewportChange, useReactFlow, useStore } from "@xyflow/react";
import { Options } from "react-hotkeys-hook";

import { MAX_ZOOM, MIN_ZOOM, PRESET_ZOOMS } from "./constants";
import { CANVAS_VIEW_SETTINGS, DEFAULT_SHORTCUT_SETTINGS, KEYBOARD_SHORTCUTS } from "@/constants";
import { useFlowStore } from "@/store";

import { type ShortcutDefinition } from "@/utils/Shortcut";

type State = {
  zoomInput: string;
  openZoomPicker: boolean;
};

type Action = { type: "setZoomInput"; value: string } | { type: "setOpenZoomPicker"; value: boolean };

const initialState: State = { zoomInput: "100", openZoomPicker: false };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "setZoomInput":
      return state.zoomInput === action.value ? state : { ...state, zoomInput: action.value };
    case "setOpenZoomPicker":
      return state.openZoomPicker === action.value ? state : { ...state, openZoomPicker: action.value };
    default:
      return state;
  }
}

type ZoomShortcutsConfig = {
  enableShortcuts?: boolean;
};

export function useZoomControls(config: ZoomShortcutsConfig = {}) {
  const zoomContainerRef = useRef<HTMLDivElement | null>(null);
  const domNode = useStore((state) => state.domNode);
  const currentZoom = useStore((state) => state.transform[2]);
  const { enableShortcuts = true } = config;

  const [state, dispatch] = useReducer(reducer, initialState);
  const { zoomTo, zoomIn, zoomOut, fitView } = useReactFlow();
  const zoomInputRef = useRef(state.zoomInput);
  const isInitializedRef = useRef(false);

  // Sync zoomInput with actual viewport zoom on mount
  useEffect(() => {
    if (!isInitializedRef.current && currentZoom) {
      const zoomPercent = String(Math.round(currentZoom * 100));
      dispatch({ type: "setZoomInput", value: zoomPercent });
      zoomInputRef.current = zoomPercent;
      isInitializedRef.current = true;
    }
  }, [currentZoom]);

  const setOpen = useCallback((value: boolean) => {
    dispatch({ type: "setOpenZoomPicker", value });
  }, []);

  const setZoomInput = useCallback((value: string) => {
    dispatch({ type: "setZoomInput", value });
  }, []);

  const applyZoomPercent = useCallback(
    (percent: number) => {
      const zoomLevel = percent / 100;
      zoomTo(zoomLevel);
    },
    [zoomTo]
  );

  const updateZoomInput = useCallback(
    (zoom: number) => {
      const raw = Math.round(zoom * 100);
      const nextStr = String(raw);

      setZoomInput(nextStr);
    },
    [setZoomInput]
  );

  const onZoomIn = useCallback(() => {
    zoomIn();
  }, [zoomIn]);

  const onZoomOut = useCallback(() => {
    zoomOut();
  }, [zoomOut]);

  const onFitView = useCallback(() => {
    fitView(CANVAS_VIEW_SETTINGS);
  }, [fitView]);

  const onZoomToFit = useCallback(() => {
    const selectedNodes = useFlowStore.getState().nodes.filter((n) => n.selected);

    if (selectedNodes.length > 0) {
      fitView({
        ...CANVAS_VIEW_SETTINGS,
        maxZoom: undefined,
        nodes: selectedNodes,
      });
    }
  }, [fitView]);

  const onSelectPreset = useCallback(
    (percent: number) => {
      applyZoomPercent(percent);
      dispatch({ type: "setOpenZoomPicker", value: false });
    },
    [applyZoomPercent]
  );

  const onInputChange = useCallback(
    (raw: string) => {
      const digitsOnly = raw.replace(/\D/g, "").slice(0, 3);
      setZoomInput(digitsOnly);
    },
    [setZoomInput]
  );

  const onSubmit = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (trimmed.length === 0) {
        applyZoomPercent(zoomInputRef.current ? parseFloat(zoomInputRef.current) : 100);
      } else {
        const numeric = parseFloat(trimmed.replace(/%/g, ""));
        if (!Number.isNaN(numeric)) {
          applyZoomPercent(numeric);
        }
      }
      dispatch({ type: "setOpenZoomPicker", value: false });
    },
    [applyZoomPercent]
  );

  useOnViewportChange({
    onChange: (viewport) => {
      updateZoomInput(viewport.zoom);
    },
    onEnd: (viewport) => {
      zoomInputRef.current = String(Math.round(viewport.zoom * 100));
    },
  });

  const hotkeyOptions: Options = useMemo(
    () => ({
      ...DEFAULT_SHORTCUT_SETTINGS,
      enabled: enableShortcuts,
      ignoreEventWhen: (event) => event.target instanceof HTMLElement && event.target.id !== domNode?.id,
    }),
    [enableShortcuts, domNode]
  );

  const zoomPreset50 = useCallback(() => applyZoomPercent(50), [applyZoomPercent]);
  const zoomPreset100 = useCallback(() => applyZoomPercent(100), [applyZoomPercent]);
  const zoomPreset200 = useCallback(() => applyZoomPercent(200), [applyZoomPercent]);

  const shortcuts = useMemo<ShortcutDefinition[]>(
    () => [
      {
        id: "zoom-in",
        keys: KEYBOARD_SHORTCUTS.ZOOM_IN.keys,
        handler: onZoomIn,
        options: hotkeyOptions,
      },
      {
        id: "zoom-out",
        keys: KEYBOARD_SHORTCUTS.ZOOM_OUT.keys,
        handler: onZoomOut,
        options: hotkeyOptions,
      },
      {
        id: "fit-to-screen",
        keys: KEYBOARD_SHORTCUTS.FIT_TO_SCREEN.keys,
        handler: onFitView,
        options: hotkeyOptions,
      },
      {
        id: "zoom-preset-50",
        keys: KEYBOARD_SHORTCUTS.ZOOM_PRESET_50.keys,
        handler: zoomPreset50,
        options: hotkeyOptions,
      },
      {
        id: "zoom-preset-100",
        keys: KEYBOARD_SHORTCUTS.ZOOM_PRESET_100.keys,
        handler: zoomPreset100,
        options: hotkeyOptions,
      },
      {
        id: "zoom-preset-200",
        keys: KEYBOARD_SHORTCUTS.ZOOM_PRESET_200.keys,
        handler: zoomPreset200,
        options: hotkeyOptions,
      },
      {
        id: "zoom-to-fit",
        keys: KEYBOARD_SHORTCUTS.ZOOM_TO_FIT.keys,
        handler: onZoomToFit,
        options: hotkeyOptions,
      },
    ],
    [hotkeyOptions, onZoomIn, onZoomOut, onFitView, zoomPreset50, zoomPreset100, zoomPreset200, onZoomToFit]
  );

  const canZoomIn = MAX_ZOOM * 100 > parseFloat(state.zoomInput);
  const canZoomOut = MIN_ZOOM * 100 < parseFloat(state.zoomInput);

  return {
    zoomInput: state.zoomInput,
    open: state.openZoomPicker,

    setOpen,
    setZoomInput,

    onZoomIn,
    onZoomOut,
    onFitView,
    onZoomToFit,
    onSelectPreset,

    canZoomIn,
    canZoomOut,

    onInputChange,
    onSubmit,

    presetZooms: PRESET_ZOOMS,
    zoomContainerRef,
    shortcuts,
  };
}
