import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

/** Identifier for the "full dataset" radio option (no subset selected). */
export const FULL_DATASET = "full-dataset";

/** Default sample percentage applied when switching dataset or subset. */
const DEFAULT_SAMPLE_RATIO = 0.1;

/** Maximum number of file entries retained in the persisted store. */
const MAX_ENTRIES = 50;

/** Computes 10% of total samples, ensuring at least 1. */
export const computeDefaultAmount = (totalSamples: number): number => Math.max(1, Math.ceil(totalSamples * DEFAULT_SAMPLE_RATIO));

interface FileEvaluationSettings {
  selectedDatasetId: string | null;
  radioValue: string;
  amount: number;
  description: string;
  /** Epoch timestamp of the last interaction with this file's settings. */
  lastAccessedAt: number;
}

interface EvaluationRunState {
  settingsByFileId: Record<string, FileEvaluationSettings>;
  getSettings: (fileId: string) => FileEvaluationSettings;
  setSelectedDatasetId: (fileId: string, id: string | null) => void;
  setRadioValue: (fileId: string, value: string) => void;
  setAmount: (fileId: string, value: number) => void;
  setDescription: (fileId: string, value: string) => void;
  /** Resets subset selection and sets amount to a default when switching datasets. */
  selectDataset: (fileId: string, datasetId: string, defaultAmount: number) => void;
  /** Sets amount to a default when switching between subsets. */
  selectRadio: (fileId: string, value: string, defaultAmount: number) => void;
  /** Resets evaluation run settings for a specific file. */
  resetFile: (fileId: string) => void;
  /** Removes entries for file IDs that are no longer valid. */
  cleanupStaleFiles: (activeFileIds: string[]) => void;
}

const defaultSettings: FileEvaluationSettings = {
  selectedDatasetId: null,
  radioValue: FULL_DATASET,
  amount: 0,
  description: "",
  lastAccessedAt: Date.now(),
};

/** Returns the settings for a file, falling back to defaults and stamping access time. */
const getFileSettings = (state: EvaluationRunState["settingsByFileId"], fileId: string): FileEvaluationSettings => {
  return state[fileId] ?? { ...defaultSettings, lastAccessedAt: Date.now() };
};

/** Evicts the least-recently-accessed entries when the map exceeds MAX_ENTRIES. */
const evictOldEntries = (map: Record<string, FileEvaluationSettings>): Record<string, FileEvaluationSettings> => {
  const keys = Object.keys(map);
  if (keys.length <= MAX_ENTRIES) return map;

  const sorted = keys.sort((a, b) => (map[b].lastAccessedAt ?? 0) - (map[a].lastAccessedAt ?? 0));
  const retained = sorted.slice(0, MAX_ENTRIES);
  const result: Record<string, FileEvaluationSettings> = {};
  for (const key of retained) {
    result[key] = map[key];
  }
  return result;
};

/** Stamps the current timestamp and applies LRU eviction after mutation. */
const withTimestampAndEviction = (
  map: Record<string, FileEvaluationSettings>,
  fileId: string,
  patch: Partial<FileEvaluationSettings>
): Record<string, FileEvaluationSettings> => {
  const updated: Record<string, FileEvaluationSettings> = {
    ...map,
    [fileId]: { ...getFileSettings(map, fileId), ...patch, lastAccessedAt: Date.now() },
  };
  return evictOldEntries(updated);
};

/**
 * Persisted Zustand store for evaluation run modal settings.
 * Retains the user's last dataset selection, subset, amount, and description per file across sessions.
 * Implements LRU eviction (capped at MAX_ENTRIES) and exposes a cleanup action for stale entries.
 */
const useEvaluationRunStore = create<EvaluationRunState>()(
  devtools(
    persist(
      (set, get) => ({
        settingsByFileId: {},

        getSettings: (fileId) => {
          const state = get();
          return getFileSettings(state.settingsByFileId, fileId);
        },

        setSelectedDatasetId: (fileId, id) =>
          set((state) => ({
            settingsByFileId: withTimestampAndEviction(state.settingsByFileId, fileId, { selectedDatasetId: id }),
          })),

        setRadioValue: (fileId, value) =>
          set((state) => ({
            settingsByFileId: withTimestampAndEviction(state.settingsByFileId, fileId, { radioValue: value }),
          })),

        setAmount: (fileId, value) =>
          set((state) => ({
            settingsByFileId: withTimestampAndEviction(state.settingsByFileId, fileId, { amount: value }),
          })),

        setDescription: (fileId, value) =>
          set((state) => ({
            settingsByFileId: withTimestampAndEviction(state.settingsByFileId, fileId, { description: value }),
          })),

        selectDataset: (fileId, datasetId, defaultAmount) =>
          set((state) => ({
            settingsByFileId: withTimestampAndEviction(state.settingsByFileId, fileId, {
              selectedDatasetId: datasetId,
              radioValue: FULL_DATASET,
              amount: defaultAmount,
            }),
          })),

        selectRadio: (fileId, value, defaultAmount) =>
          set((state) => ({
            settingsByFileId: withTimestampAndEviction(state.settingsByFileId, fileId, {
              radioValue: value,
              amount: defaultAmount,
            }),
          })),

        resetFile: (fileId) =>
          set((state) => {
            const { [fileId]: _, ...rest } = state.settingsByFileId;
            return { settingsByFileId: rest };
          }),

        cleanupStaleFiles: (activeFileIds) =>
          set((state) => {
            const activeSet = new Set(activeFileIds);
            const cleaned: Record<string, FileEvaluationSettings> = {};
            for (const [id, settings] of Object.entries(state.settingsByFileId)) {
              if (activeSet.has(id)) {
                cleaned[id] = settings;
              }
            }
            return { settingsByFileId: cleaned };
          }),
      }),
      {
        name: "evaluation-run-store",
        version: 2,
        migrate: (persisted, version) => {
          if (version < 2) {
            const state = persisted as { settingsByFileId?: Record<string, Omit<FileEvaluationSettings, "lastAccessedAt">> };
            const migrated: Record<string, FileEvaluationSettings> = {};
            if (state.settingsByFileId) {
              for (const [id, settings] of Object.entries(state.settingsByFileId)) {
                migrated[id] = { ...settings, lastAccessedAt: Date.now() };
              }
            }
            return { ...state, settingsByFileId: migrated };
          }
          return persisted as EvaluationRunState;
        },
      }
    ),
    { enabled: import.meta.env.DEV, name: "EvaluationRunStore" }
  )
);

export default useEvaluationRunStore;
