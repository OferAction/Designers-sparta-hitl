import { useEffect } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";

import { $createTypesSelectionNode } from "./TypesSelectionNode";

export default function InsertTypesPlugin() {
  const [editor] = useLexicalComposerContext();

  const checkIfShouldOpen = () => {
    try {
      const editorState = editor.getEditorState();
      let should = false;
      editorState.read(() => {
        const json = editorState.toJSON();

        // If any typesSelection exists anywhere, do not insert another
        const scanForTypes = (n: any): boolean => {
          if (!n) return false;
          if (Array.isArray(n)) return n.some(scanForTypes);
          if (typeof n === "object") {
            if (n.type === "typesSelection") return true;
            return scanForTypes(n.children);
          }
          return false;
        };
        if (scanForTypes(json.root)) {
          should = false;
          return;
        }

        // Find a paragraph that contains [function:isinstance, variable] sequence
        const rootChildren = (json as any)?.root?.children || [];
        for (const para of rootChildren) {
          const ch = para?.children || [];
          for (let i = 0; i < ch.length - 1; i++) {
            const a = ch[i];
            const b = ch[i + 1];
            if (a?.type === "variableReference" && a?.nodeVariant === "function" && String(a.value).toLowerCase() === "isinstance") {
              if (b?.type === "variableReference" && b?.nodeVariant === "variable") {
                // check next sibling after b is not typesSelection
                const next = ch[i + 2];
                if (!next || next.type !== "typesSelection") {
                  should = true;
                  return;
                }
              }
            }
          }
        }
      });
      return should;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const el = editor.getRootElement();
    if (!el) return;

    const tryInsert = () => {
      if (!checkIfShouldOpen()) return;
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const node = $createTypesSelectionNode([]);
          selection.insertNodes([node]);
          node.selectEnd();
        }
      });
    };

    const onClick = () => tryInsert();
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === " " || ev.key === "Enter") tryInsert();
    };

    el.addEventListener("click", onClick);
    el.addEventListener("keydown", onKeyDown);

    return () => {
      el.removeEventListener("click", onClick);
      el.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  return null;
}
