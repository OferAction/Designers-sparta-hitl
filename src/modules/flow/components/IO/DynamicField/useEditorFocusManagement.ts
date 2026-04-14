import { useEffect, useRef } from "react";
import { LexicalEditor } from "lexical";

type UseEditorFocusManagementProps = {
  editor: LexicalEditor;
  dropdownRef: React.RefObject<{ getElement: () => HTMLElement | null | undefined }>;
  onUpdate: () => void;
  onClose: () => void;
};

export const useEditorFocusManagement = ({ editor, dropdownRef, onUpdate, onClose }: UseEditorFocusManagementProps) => {
  const currentDropdownElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      onUpdate();
    };

    const addScrollListener = () => {
      window.addEventListener("scroll", handleScroll, true);
    };

    const removeScrollListener = () => {
      window.removeEventListener("scroll", handleScroll, true);
    };

    const addDropdownListener = (element: HTMLElement) => {
      element.addEventListener("blur", handleDropdownBlur, true);
      currentDropdownElementRef.current = element;
    };

    const removeDropdownListener = () => {
      if (currentDropdownElementRef.current) {
        currentDropdownElementRef.current.removeEventListener("blur", handleDropdownBlur, true);
        currentDropdownElementRef.current = null;
      }
    };

    const handleDropdownBlur = (ev: FocusEvent) => {
      const editorElement = editor.getRootElement();
      const focusMovedToEditor = editorElement?.contains(ev.relatedTarget as HTMLElement);

      if (focusMovedToEditor) return;

      onClose();
      removeScrollListener();
      removeDropdownListener();
    };

    const handleBlur = (ev: FocusEvent) => {
      const dropdownElement = dropdownRef.current?.getElement();
      const focusMovedToDropdown = dropdownElement && dropdownElement.contains(ev.relatedTarget as HTMLElement);

      if (focusMovedToDropdown) {
        const isAlreadyListening = currentDropdownElementRef.current === dropdownElement;
        if (isAlreadyListening) return;

        removeDropdownListener();
        addDropdownListener(dropdownElement);
        return;
      }

      onClose();
      removeScrollListener();
    };

    const handleFocus = () => {
      onUpdate();
      addScrollListener();
    };

    const editorElement = editor.getRootElement();
    if (editorElement) {
      editorElement.addEventListener("blur", handleBlur, true);
      editorElement.addEventListener("focus", handleFocus, true);
    }

    return () => {
      editorElement?.removeEventListener("blur", handleBlur, true);
      editorElement?.removeEventListener("focus", handleFocus, true);
      removeScrollListener();
      removeDropdownListener();
    };
  }, [editor, dropdownRef, onUpdate, onClose]);
};
