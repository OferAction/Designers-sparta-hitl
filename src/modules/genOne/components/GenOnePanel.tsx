import React from "react";

import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatMessage, { ChatMessageProps } from "./ChatMessage";
import ChatStartMessage from "./ChatStartMessage";
import DragDropOverlay from "./DragDropOverlay";
import { Option } from "@/components/ui/input-tag";
import { DynamicFieldValue } from "@/modules/flow/components/IO";
import { cn } from "@/utils";

interface GenOnePanelProps {
  isOpen: boolean;
  messages: ChatMessageProps[];
  selectedFiles: File[];
  isLoading: boolean;
  isDragging: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  allValueOptions: NonNullable<Option>[];
  onClose: () => void;
  onNewSession: () => void;
  onSendMessage: (message: string, expression: DynamicFieldValue) => void;
  onFileSelect: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  onClearFiles: () => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

const GenOnePanel: React.FC<GenOnePanelProps> = ({
  isOpen,
  messages,
  selectedFiles,
  isLoading,
  isDragging,
  messagesEndRef,
  allValueOptions,
  onClose,
  onNewSession,
  onSendMessage,
  onFileSelect,
  onRemoveFile,
  onClearFiles,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
}) => {
  return (
    <div
      className={cn(
        "absolute left-20 top-20 z-20 flex flex-col overflow-hidden bg-sidebar origin-top-left transform-gpu transition-all duration-200 ease-in-out",
        isOpen
          ? "h-full w-[420px] scale-100 opacity-100 pointer-events-auto rounded-tr-lg shadow-lg top-0 left-0"
          : "h-14 w-14 scale-50 opacity-0 pointer-events-none"
      )}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <>
        <ChatHeader onClose={onClose} onNewSession={onNewSession} />

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          <ChatStartMessage />
          {messages.map((message, index) => {
            const previousMessage = index > 0 ? messages[index - 1] : null;
            return <ChatMessage key={message.id} {...message} previousMessageType={previousMessage?.type || null} />;
          })}
          <div ref={messagesEndRef as React.RefObject<HTMLDivElement>} />
        </div>

        <ChatInput
          onSendMessage={onSendMessage}
          onFileSelect={onFileSelect}
          selectedFiles={selectedFiles}
          onRemoveFile={onRemoveFile}
          onClearFiles={onClearFiles}
          disabled={isLoading}
          scope={allValueOptions}
        />

        <DragDropOverlay isVisible={isDragging} />
      </>
    </div>
  );
};

export default GenOnePanel;
