import { isMacOs } from "react-device-detect";

// Key symbols for display
export const KEY_SYMBOLS = {
  // Mac symbols
  mac: {
    cmd: "⌘",
    ctrl: "⌃",
    alt: "⌥",
    shift: "⇧",
    enter: "↵",
    esc: "⎋",
    right: "→",
    left: "←",
    up: "↑",
    down: "↓",
    tab: "⇥",
    backspace: "⌫",
  },
  // Windows symbols
  win: {
    cmd: "Ctrl",
    ctrl: "Ctrl",
    alt: "Alt",
    shift: "Shift",
    enter: "Enter",
    esc: "Esc",
    right: "→",
    left: "←",
    up: "↑",
    down: "↓",
    tab: "Tab",
    backspace: "Backspace",
  },
} as const;

// Helper to get platform symbols
const isMac = isMacOs;
const K = isMac ? KEY_SYMBOLS.mac : KEY_SYMBOLS.win;

export const KEYBOARD_SHORTCUTS = {
  SHORTCUTS_PANEL: {
    keys: ["ctrl+shift+slash", "ctrl+shift+numpaddivide", "meta+shift+slash", "meta+shift+numpaddivide"],
    display: [K.cmd, K.shift, "/"],
  },
  NEW_WORKFLOW: {
    keys: ["ctrl+shift+m", "meta+shift+m"],
    display: [K.cmd, K.shift, "M"],
  },
  MOVE_TOOL: {
    keys: ["v"],
    display: ["V"],
  },
  HAND_TOOL: {
    keys: ["h"],
    display: ["H"],
  },
  ZOOM_IN: {
    keys: ["ctrl+plus", "ctrl+equal", "ctrl+numpadadd", "meta+plus", "meta+=", "meta+numpadadd"],
    display: [K.cmd, "+"],
  },
  ZOOM_OUT: {
    keys: ["ctrl+minus", "ctrl+numpadsubtract", "meta+minus", "meta+numpadsubtract"],
    display: [K.cmd, "-"],
  },
  FIT_TO_SCREEN: {
    keys: ["ctrl+alt+enter", "meta+alt+enter", "ctrl+alt+numpadenter", "meta+alt+numpadenter", "meta+option+enter", "ctrl+option+numpadenter"],
    display: [K.cmd, K.alt, K.enter],
  },
  PRESENT: {
    keys: ["ctrl+slash", "meta+slash", "ctrl+numpaddivide", "meta+numpaddivide"],
    display: [K.cmd, "/"],
  },
  NODES_TEMPLATE_MENU: {
    keys: ["ctrl+1", "meta+1"],
    display: [K.cmd, "1"],
  },
  SUBFLOW_TEMPLATE_MENU: {
    keys: ["ctrl+2", "meta+2"],
    display: [K.cmd, "2"],
  },
  CONNECTOR_TEMPLATE_MENU: {
    keys: ["ctrl+3", "meta+3"],
    display: [K.cmd, "3"],
  },
  SYSTEM_RULES_PANEL: {
    keys: ["ctrl+g", "meta+g"],
    display: [K.cmd, "G"],
  },
  EVALUATION_PANEL: {
    keys: ["ctrl+e", "meta+e"],
    display: [K.cmd, "E"],
  },
  DATASET_PANEL: {
    keys: ["ctrl+p", "meta+p"],
    display: [K.cmd, "P"],
  },
  MONITORING_PANEL: {
    keys: ["ctrl+o", "meta+o"],
    display: [K.cmd, "O"],
  },
  SELECT_ALL: {
    keys: ["ctrl+a", "meta+a"],
    display: [K.cmd, "A"],
  },
  SELECT_NEXT_NODE: {
    keys: ["ctrl+arrowright", "meta+arrowright"],
    display: [K.cmd, K.right],
  },
  SELECT_PREVIOUS_NODE: {
    keys: ["ctrl+arrowleft", "meta+arrowleft"],
    display: [K.cmd, K.left],
  },
  ZOOM_PRESET_50: {
    keys: ["ctrl+alt+5", "ctrl+alt+numpad5", "meta+alt+5", "meta+alt+numpad5"],
    display: [K.cmd, K.alt, "5"],
  },
  ZOOM_PRESET_100: {
    keys: ["ctrl+alt+0", "ctrl+alt+numpad0", "meta+alt+0", "meta+alt+numpad0"],
    display: [K.cmd, K.alt, "0"],
  },
  ZOOM_PRESET_200: {
    keys: ["ctrl+alt+2", "ctrl+alt+numpad2", "meta+alt+2", "meta+alt+numpad2", "arrowdown"],
    display: [K.cmd, K.alt, "2"],
  },
  ZOOM_TO_FIT: {
    keys: ["ctrl+alt+1", "ctrl+alt+numpad1", "meta+alt+1", "meta+alt+numpad1"],
    display: [K.cmd, K.alt, "1"],
  },
  ESCAPE_KEY: {
    keys: ["escape"],
    display: [K.esc],
  },
  UNDO: {
    keys: ["ctrl+z", "meta+z"],
    display: [K.cmd, "Z"],
  },
  REDO: {
    keys: ["ctrl+y", "meta+y"],
    display: [K.cmd, "Y"],
  },
  COPY_NODE_PROPERTIES: {
    keys: ["ctrl+shift+c", "meta+shift+c"],
    display: [K.cmd, K.shift, "C"],
  },
  PASTE_NODE_PROPERTIES: {
    keys: ["ctrl+shift+v", "meta+shift+v"],
    display: [K.cmd, K.shift, "V"],
  },
  COPY_NODE: {
    keys: ["ctrl+c", "meta+c"],
    display: [K.cmd, "C"],
  },
  PASTE_NODE: {
    keys: ["ctrl+v", "meta+v"],
    display: [K.cmd, "V"],
  },
  DUPLICATE_NODE: {
    keys: ["ctrl+d", "meta+d"],
    display: [K.cmd, "D"],
  },
  REPLACE_WITH_CLIPBOARD: {
    keys: ["ctrl+shift+d", "meta+shift+d"],
    display: [K.cmd, K.shift, "D"],
  },
  CREATE_SUBFLOW: {
    keys: ["shift+s"],
    display: [K.shift, "S"],
  },
  RUN_PATH: {
    keys: ["ctrl+r", "meta+r"],
    display: [K.cmd, "R"],
  },
};

export const LEFT_PANEL_SHORTCUTS = [
  { shortcut: KEYBOARD_SHORTCUTS.NODES_TEMPLATE_MENU.keys, action: "NodeTemplates" as const },
  { shortcut: KEYBOARD_SHORTCUTS.SUBFLOW_TEMPLATE_MENU.keys, action: "SubflowTemplates" as const },
  { shortcut: KEYBOARD_SHORTCUTS.CONNECTOR_TEMPLATE_MENU.keys, action: "ConnectorTemplates" as const },
  { shortcut: KEYBOARD_SHORTCUTS.SYSTEM_RULES_PANEL.keys, action: "systemRules" as const },
  { shortcut: KEYBOARD_SHORTCUTS.EVALUATION_PANEL.keys, action: "Evaluation" as const },
  { shortcut: KEYBOARD_SHORTCUTS.DATASET_PANEL.keys, action: "Dataset" as const },
] as const;

export const DEFAULT_SHORTCUT_SETTINGS = {
  preventDefault: true,
};
