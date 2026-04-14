import { enablePatches, produceWithPatches } from "immer";
import debounce from "lodash.debounce";
import { createStore } from "zustand";

import { historyStateCreator, type HistoryStore, type HistoryOptions } from "./historyStore";
import { mergeDeep } from "@/utils";

import type { Mutate, StateCreator, StoreApi, StoreMutatorIdentifier } from "zustand";

enablePatches();

type HistoryStoreApi<T> = StoreApi<HistoryStore<T>>;

type Historized = <State, Mps extends [StoreMutatorIdentifier, unknown][] = [], Mcs extends [StoreMutatorIdentifier, unknown][] = []>(
  config: StateCreator<State, [...Mps, ["history", unknown]], Mcs>,
  options?: HistoryOptions
) => StateCreator<State, Mps, [["history", HistoryStoreApi<State>], ...Mcs]>;

type Write<T, U> = Omit<T, keyof U> & U;

declare module "zustand/vanilla" {
  interface StoreMutators<S, A> {
    history: Write<S, { history: A }>;
  }
}

export const historyMiddleware = (<T extends object>(f: StateCreator<T, [], []>, options?: HistoryOptions): StateCreator<T, [], []> => {
  const configWithHistory = ((set, get, store: Mutate<StoreApi<T>, [["history", HistoryStoreApi<T>]]>) => {
    store.history = createStore(historyStateCreator(set, get, options));
    const debouncedSave = debounce(() => {
      const { capturedState, capturedChanges } = store.history.getState();

      if (capturedState && capturedChanges) {
        const [, patches, inversePatches] = produceWithPatches(capturedState, (draft) => {
          mergeDeep(draft, capturedChanges, draft, options?.exclude);
        });

        if (patches.length > 0) {
          store.history.getState().addNewPatch(patches, inversePatches);
        }
      }
      store.history.setState(() => ({
        capturedState: null,
        capturedChanges: null,
      }));
    }, options?.debounceDelay || 300);

    const wrappedSet: typeof set = (...args) => {
      if (store.history.getState().isPaused) {
        store.history.setState(() => ({
          capturedState: null,
          capturedChanges: null,
        }));
        return set(...(args as Parameters<typeof set>));
      }
      const capturedState = store.history.getState().capturedState;
      if (!capturedState) {
        store.history.setState(() => ({
          capturedState: get(),
        }));
      }

      store.history.setState((state) => ({
        capturedChanges: {
          ...state.capturedChanges,
          ...args[0],
        },
      }));
      set(...(args as Parameters<typeof set>));
      debouncedSave();
    };

    return f(wrappedSet, get, store);
  }) as StateCreator<T, [], []>;

  return configWithHistory;
}) as unknown as Historized;

export type { Historized, HistoryOptions };
