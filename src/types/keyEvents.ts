type KeyModifier = "ctrlKey" | "metaKey" | "altKey";

type KeyCombination = {
  key: string;
  modifiers?: KeyModifier[];
  preventDefault?: boolean;
};

type KeyAction = {
  combination: KeyCombination;
  action: string | (() => void);
  description?: string;
  enabled?: boolean;
};

export type KeyEventMap = Record<string, KeyAction>;
