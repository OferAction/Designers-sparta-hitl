import { RefObject, useMemo } from "react";

import { Option } from "@/components/ui/input-tag";

export interface SuggestionInfo {
  before: string;
  match: string;
  after: string;
  canSuggest: boolean;
}

interface UseSuggestionInfoProps {
  inputValue?: Option;
  isOpen: boolean;
  containerRef: RefObject<HTMLElement>;
  cmdkValue: string;
}

export const getSelectedItem = (containerRef: HTMLElement | undefined | null, cmdkValue: string) => {
  const cmdkRoot = containerRef?.closest("[cmdk-root]");
  if (!cmdkRoot) return null;

  const selectedItem =
    cmdkRoot?.querySelector(`[cmdk-item][data-value="${cmdkValue}"]`) || cmdkRoot?.querySelector('[cmdk-item]:not([aria-disabled="true"])');

  return selectedItem?.getAttribute("data-label") || "";
};

export const shouldShowSuggestions = (searchValue: Option | undefined, filteredCount: number, suggestionInfo: SuggestionInfo) => {
  return searchValue?.label?.trim() && filteredCount > 0 && suggestionInfo.canSuggest;
};

export const useSuggestionInfo = ({ inputValue, isOpen, containerRef, cmdkValue }: UseSuggestionInfoProps): SuggestionInfo => {
  return useMemo(() => {
    const inputLabel = inputValue?.label?.trimStart().startsWith("@") ? inputValue?.label?.trimStart().substring(1) : inputValue?.label;
    if (!inputLabel?.trim() || !containerRef.current) {
      return { before: "", match: "", after: "", canSuggest: false };
    }

    const selectedItem = getSelectedItem(containerRef.current, cmdkValue);
    if (!selectedItem) {
      return { before: "", match: "", after: "", canSuggest: false };
    }

    const searchLower = inputLabel.toLowerCase();
    const titleLower = selectedItem.toLowerCase();
    const matchIndex = titleLower.indexOf(searchLower);

    if (matchIndex === -1) {
      return { before: "", match: selectedItem, after: "", canSuggest: false };
    }

    return {
      before: selectedItem.substring(0, matchIndex),
      match: selectedItem.substring(matchIndex, matchIndex + inputLabel.length),
      after: selectedItem.substring(matchIndex + inputLabel.length),
      canSuggest: isOpen && titleLower !== searchLower,
    };
  }, [inputValue, containerRef, cmdkValue, isOpen]);
};
