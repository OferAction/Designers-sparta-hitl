import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, $isTextNode, TextNode } from "lexical";

import { useAdjustedMenuPosition } from "./useAdjustedMenuPosition";
import { useEditorFocusManagement } from "./useEditorFocusManagement";
import { OptionsDropdownHandle } from "@/components/common/input-tags/OptionsDropdown";
import { Option } from "@/components/ui/input-tag";

type MenuPosition = {
  x: number;
  y: number;
} | null;

function createQueryMatcher(trigger: string) {
  // Escape special regex characters in the trigger
  const escapedTrigger = trigger.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedTrigger}\\w*)$`);

  return (text: string): { query: string; queryStartIndex: number } | null => {
    const match = regex.exec(text);
    if (match !== null) {
      return {
        query: match[1].substring(trigger.length), // Remove trigger symbol
        queryStartIndex: match.index,
      };
    }
    return null;
  };
}

export type UseVariableReferenceMenuOptions = {
  /** The trigger character (e.g., '@' for variables, '#' for operators). Default: '@' */
  trigger?: string;
  /** Optional container element that the dropdown is rendered within */
  portalContainer?: HTMLElement | null;
};

export const useVariableReferenceMenu = (options: UseVariableReferenceMenuOptions = {}) => {
  const { trigger = "@", portalContainer: portalContainerProp = document.body } = options;

  const [editor] = useLexicalComposerContext();
  const [searchValue, setSearchValue] = useState<Option>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>(null);
  const [shouldOpenDropdown, setShouldOpenDropdown] = useState(false);
  const [queryStartIndex, setQueryStartIndex] = useState<number | null>(null);
  const [cursorOffset, setCursorOffset] = useState<number | null>(null);
  const triggerNodeRef = useRef<TextNode | null>(null);
  const dropdownRef = useRef<OptionsDropdownHandle>(null);

  // Memoize the query matcher based on trigger
  const getQueryFromText = useMemo(() => createQueryMatcher(trigger), [trigger]);

  const closeMenu = useCallback(() => {
    setSearchValue(null);
    setShouldOpenDropdown(false);
    triggerNodeRef.current = null;
    setMenuPosition(null);
    setQueryStartIndex(null);
    setCursorOffset(null);
  }, []);

  const calculateMenuPosition = useCallback(() => {
    const portalContainer = portalContainerProp || document.body;

    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return null;

    const node = selection.anchor.getNode();
    const textNode = $isTextNode(node) ? node : null;

    if (!textNode) return null;

    const textContent = textNode.getTextContent().slice(0, selection.anchor.offset);
    const queryInfo = getQueryFromText(textContent);

    if (!queryInfo) return null;

    const { query, queryStartIndex } = queryInfo;
    setSearchValue({ value: query, label: query });
    setQueryStartIndex(queryStartIndex);
    setCursorOffset(selection.anchor.offset);
    triggerNodeRef.current = textNode;

    // Get the DOM element for the text node
    const textDOMNode = editor.getElementByKey(textNode.getKey());
    if (!textDOMNode) return null;

    // Create a range at the trigger sign position
    const domSelection = window.getSelection();
    if (!domSelection) return null;

    const range = document.createRange();
    const textNodeDOM = textDOMNode.firstChild; // Get the actual text node

    if (!textNodeDOM || textNodeDOM.nodeType !== Node.TEXT_NODE) return null;

    // Set range to the trigger character position
    range.setStart(textNodeDOM, queryStartIndex);
    range.setEnd(textNodeDOM, queryStartIndex + 1);

    const rect = range.getBoundingClientRect();

    // Check viewport boundaries
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const isInViewport =
      rect.top >= 0 && rect.bottom <= viewportHeight && rect.left >= 0 && rect.right <= viewportWidth && rect.width > 0 && rect.height > 0;

    if (!isInViewport) return null;

    // Check if the trigger position is actually visible (not just in viewport bounds)
    const topElement = document.elementFromPoint(rect.left, rect.top);
    const isVisible =
      topElement && textDOMNode && (topElement === textDOMNode || topElement.contains(textDOMNode) || textDOMNode.contains(topElement));

    if (!isVisible) return null;

    const containerRect = portalContainer.getBoundingClientRect();

    return {
      x: rect.left - containerRect.left,
      y: rect.bottom - containerRect.top,
    };
  }, [editor, getQueryFromText, portalContainerProp]);

  const updateMenu = useCallback(() => {
    editor.getEditorState().read(() => {
      const position = calculateMenuPosition();
      if (position) {
        setShouldOpenDropdown(true);
        setMenuPosition(position);
      } else {
        closeMenu();
      }
    });
  }, [editor, closeMenu, calculateMenuPosition]);

  useEffect(() => {
    return editor.registerUpdateListener(() => {
      updateMenu();
    });
  }, [editor, updateMenu]);

  useEditorFocusManagement({
    editor,
    dropdownRef,
    onUpdate: updateMenu,
    onClose: closeMenu,
  });

  const adjustedMenuPosition = useAdjustedMenuPosition({
    isOpen: shouldOpenDropdown,
    position: menuPosition,
    dropdownRef,
    portalContainer: portalContainerProp,
  });

  return {
    searchValue,
    menuPosition: adjustedMenuPosition,
    triggerNodeRef,
    closeMenu,
    dropdownRef,
    shouldOpenDropdown,
    queryStartIndex,
    cursorOffset,
  };
};
