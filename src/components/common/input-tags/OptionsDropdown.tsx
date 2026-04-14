import { forwardRef, useImperativeHandle, useRef, useCallback } from "react";

import { CommandItemRenderer } from "./CommandItemRenderer";
import { InputTag, Option } from "@/components/ui/input-tag";

type OptionsDropdownProps = {
  options: NonNullable<Option>[];
  emptyMessage?: string;
  className?: string;
};

export interface OptionsDropdownHandle {
  /**
   * Move selection to the next item in the list
   */
  selectNext: () => void;
  /**
   * Move selection to the previous item in the list
   */
  selectPrevious: () => void;
  /**
   * Select the first item in the list
   */
  selectFirst: () => void;
  /**
   * Select the last item in the list
   */
  selectLast: () => void;
  /**
   * Trigger selection of the currently highlighted item
   */
  selectCurrent: () => void;
  /**
   * Get the currently selected option value
   */
  getSelectedValue: () => string | null;

  getBoundingClientRect: () => DOMRect | null;

  getElement: () => HTMLElement | null;
}

/**
 * A reusable dropdown component that renders a list of options.
 * This component is used by both AutocompleteTag (attached to input) and
 * VariableReferencePlugin (floating at cursor position).
 *
 * Exposes imperative handlers via ref for keyboard navigation:
 * - selectNext/selectPrevious: Arrow key navigation
 * - selectFirst/selectLast: Home/End key navigation
 * - selectCurrent: Enter key selection
 * - getSelectedValue: Get current selection
 */
export const OptionsDropdown = forwardRef<OptionsDropdownHandle, OptionsDropdownProps>(
  ({ options, emptyMessage = "No options found.", className }, ref) => {
    const listRef = useRef<HTMLDivElement>(null);

    const selectNext = useCallback(() => {
      if (!listRef.current) return;
      const items = listRef.current.querySelectorAll('[cmdk-item=""]');
      const selected = listRef.current.querySelector('[data-selected="true"]');

      if (!selected && items.length > 0) {
        // No selection, select first
        (items[0] as HTMLElement)?.focus();
        (items[0] as HTMLElement)?.scrollIntoView({ block: "center" });
        (items[0] as HTMLElement)?.setAttribute("data-selected", "true");
        return;
      }

      const currentIndex = Array.from(items).indexOf(selected as Element);
      const nextIndex = (currentIndex + 1) % items.length;
      if (nextIndex !== currentIndex) {
        (selected as HTMLElement)?.setAttribute("data-selected", "false");
        (items[nextIndex] as HTMLElement)?.focus();
        (items[nextIndex] as HTMLElement)?.scrollIntoView({ block: "center" });
        (items[nextIndex] as HTMLElement)?.setAttribute("data-selected", "true");
      }
    }, []);

    const selectPrevious = useCallback(() => {
      if (!listRef.current) return;
      const items = listRef.current.querySelectorAll('[cmdk-item=""]');
      const selected = listRef.current.querySelector('[data-selected="true"]');

      if (!selected && items.length > 0) {
        // No selection, select last
        const lastItem = items[items.length - 1];
        (lastItem as HTMLElement)?.focus();
        (lastItem as HTMLElement)?.scrollIntoView({ block: "center" });
        (lastItem as HTMLElement)?.setAttribute("data-selected", "true");
        return;
      }

      const currentIndex = Array.from(items).indexOf(selected as Element);
      const prevIndex = (currentIndex - 1 + items.length) % items.length;
      if (prevIndex !== currentIndex) {
        (selected as HTMLElement)?.setAttribute("data-selected", "false");
        (items[prevIndex] as HTMLElement)?.focus();
        (items[prevIndex] as HTMLElement)?.scrollIntoView({ block: "center" });
        (items[prevIndex] as HTMLElement)?.setAttribute("data-selected", "true");
      }
    }, []);

    const selectFirst = useCallback(() => {
      if (!listRef.current) return;
      const items = listRef.current.querySelectorAll('[cmdk-item=""]');
      if (items.length > 0) {
        const selected = listRef.current.querySelector('[data-selected="true"]');
        (selected as HTMLElement)?.setAttribute("data-selected", "false");
        (items[0] as HTMLElement)?.focus();
        (items[0] as HTMLElement)?.scrollIntoView({ block: "center" });
        (items[0] as HTMLElement)?.setAttribute("data-selected", "true");
      }
    }, []);

    const selectLast = useCallback(() => {
      if (!listRef.current) return;
      const items = listRef.current.querySelectorAll('[cmdk-item=""]');
      if (items.length > 0) {
        const selected = listRef.current.querySelector('[data-selected="true"]');
        (selected as HTMLElement)?.setAttribute("data-selected", "false");
        const lastItem = items[items.length - 1];
        (lastItem as HTMLElement)?.focus();
        (lastItem as HTMLElement)?.scrollIntoView({ block: "center" });
        (lastItem as HTMLElement)?.setAttribute("data-selected", "true");
      }
    }, []);

    const selectCurrent = useCallback(() => {
      if (!listRef.current) return;
      const selected = listRef.current.querySelector('[data-selected="true"]') as HTMLElement;
      if (selected) {
        selected.click();
      }
    }, []);

    const getSelectedValue = useCallback(() => {
      if (!listRef.current) return null;
      const selected = listRef.current.querySelector('[data-selected="true"]');
      return selected?.getAttribute("data-value") || null;
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        selectNext,
        selectPrevious,
        selectFirst,
        selectLast,
        selectCurrent,
        getSelectedValue,
        getBoundingClientRect: () => listRef.current?.getBoundingClientRect() || null,
        getElement: () => listRef.current,
      }),
      [selectNext, selectPrevious, selectFirst, selectLast, selectCurrent, getSelectedValue]
    );

    return (
      <InputTag.CommandList ref={listRef} className={className}>
        {options.map((option, index) => (
          <CommandItemRenderer key={option.value} option={option} isFirst={index === 0} />
        ))}
        <InputTag.CommandEmpty className="px-2">{emptyMessage}</InputTag.CommandEmpty>
      </InputTag.CommandList>
    );
  }
);

OptionsDropdown.displayName = "OptionsDropdown";
