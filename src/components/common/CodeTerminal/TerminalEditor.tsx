import { useExpandedDialog } from "./context/ExpandedDialogContext";
import { useTerminal } from "./context/TerminalContext";
import { CodeEditor, PythonCodeEditor } from "@/components/common/code-editor";
import { EditorProps } from "@/components/common/code-editor/CodeEditor";
import { defaultInitialCodes } from "@/constants";
import { cn } from "@/utils";

export const TerminalEditor = ({ initialCode: initialCodeProp, language: controlledLanguage, value: controlledValue, ...props }: EditorProps) => {
  const { setValue, language: uncontrolledLanguage, value: uncontrolledValue, expanded } = useTerminal();
  const { expanded: dialogExpanded } = useExpandedDialog();
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const language = controlledLanguage ?? uncontrolledLanguage;

  const onChange = (newCode: string) => {
    props.onChange?.(newCode);
    if (!isControlled) {
      setValue(newCode);
    }
  };

  const options = {
    fixedOverflowWidgets: expanded ? false : true,
    ...props.options,
  };

  const stringValue =
    (typeof value === "string" ? value : JSON.stringify(value, null, 2)) ||
    initialCodeProp ||
    defaultInitialCodes[language as keyof typeof defaultInitialCodes] ||
    "";
  if (language === "python") {
    return (
      <PythonCodeEditor
        {...props}
        value={stringValue}
        onChange={onChange}
        options={options}
        className={cn(props.className, dialogExpanded ? "h-[600px]" : "")}
      />
    );
  }

  return <CodeEditor {...props} value={stringValue} language={language} onChange={onChange} options={options} />;
};
