import React, { useState, useRef, useCallback } from "react";

import { PaperclipIcon, PaperPlaneRightIcon } from "@phosphor-icons/react";

import FilePreview from "./FilePreview";
import { Button } from "@/components/ui/button";
import { Option } from "@/components/ui/input-tag";
import { DynamicField, DynamicFieldValue, convertDynamicFieldValueToString } from "@/modules/flow/components/IO";

interface ChatInputProps {
  onSendMessage: (message: string, expression: DynamicFieldValue) => void;
  onFileSelect?: (files: File[]) => void;
  selectedFiles?: File[];
  onRemoveFile?: (index: number) => void;
  onClearFiles?: () => void;
  disabled?: boolean;
  scope?: NonNullable<Option>[];
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onFileSelect, selectedFiles = [], onRemoveFile, onClearFiles, disabled = false, scope }) => {
  const [inputValue, setInputValue] = useState<DynamicFieldValue>("");
  const [editorKey, setEditorKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = useCallback((value: DynamicFieldValue) => {
    setInputValue(value);
  }, []);

  const getMessageText = useCallback((): string => {
    if (typeof inputValue === "string") {
      return inputValue;
    }
    return convertDynamicFieldValueToString(inputValue);
  }, [inputValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const messageText = getMessageText();
    if ((!messageText.trim() && selectedFiles.length === 0) || disabled) return;

    onSendMessage(messageText, inputValue);
    setInputValue("");
    // Force re-render of DynamicField to clear it
    setEditorKey((prev) => prev + 1);
    // Clear files after sending
    if (onClearFiles) {
      onClearFiles();
    }
  };

  const handleRemoveFile = (index: number) => {
    if (onRemoveFile) {
      onRemoveFile(index);
    }
  };


  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0 && onFileSelect) {
      onFileSelect(files);
    }
    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePaperclipClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };


  const messageText = getMessageText();

  return (
    <div className="p-4 border-border">
      {/* File Preview */}


      {/* Hidden file input for paperclip icon */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.txt"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex flex-row gap-2 ">

        <div className="flex-1 flex-col bg-background rounded-md flex p-2 focus-within:ring-1 focus-within:ring-border">
          {selectedFiles.length > 0 && (
            <div className="mb-3">
              <FilePreview files={selectedFiles} onRemoveFile={handleRemoveFile} />
            </div>
          )}
          <div className="flex-1" onKeyDown={handleKeyDown}>
            <DynamicField
              key={editorKey}
              placeholder="Build, ask, learn..."
              value={inputValue}
              onChange={handleInputChange}
              scope={scope}
              className="chat-input-dynamic-field [&_.editor-paragraph]:m-0 [&>div]:min-h-[24px] [&>div]:max-h-[250px] [&>div]:h-auto [&>div]:px-0.5 [&>div]:py-1 [&>div]:border-none [&>div]:bg-transparent [&>div]:focus-within:ring-0 [&>div]:focus-within:ring-offset-0 [&>div]:rounded-md [&>div]:overflow-y-auto"
            />

            <div className="flex py-1 justify-between">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={handlePaperclipClick}
                disabled={disabled}
                className="group flex-shrink-0 p-0 bg-transparent hover:bg-transparent"
                title="Attach files"
              >
                <PaperclipIcon className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
              </Button>

              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="flex-shrink-0 p-2 mr-1"
                disabled={disabled || (!messageText.trim() && selectedFiles.length === 0)}
                title="Send message"
                onClick={handleSubmit}
              >
                <PaperPlaneRightIcon className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
