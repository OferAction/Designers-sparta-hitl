import React from "react";

import GenOneButton from "./components/GenOneButton";
import GenOnePanel from "./components/GenOnePanel";
import { useGenOne } from "./hooks";
import { GenOneNotificationSubscriber } from "@/modules/flow/components";

const GenOne: React.FC = () => {
  const {
    messages,
    selectedFiles,
    isGenOneOpen,
    genOneLoading,
    hasNotification,
    hasOrchestration,
    isDragging,
    messagesEndRef,
    allValueOptions,
    handleTogglePanel,
    handleNewSession,
    handleSendMessage,
    handleWorkflowNotification,
    handleFileSelect,
    handleRemoveFile,
    handleClearFiles,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  } = useGenOne();

  return (
    <>
      <GenOnePanel
        isOpen={isGenOneOpen}
        messages={messages}
        selectedFiles={selectedFiles}
        isLoading={genOneLoading}
        isDragging={isDragging}
        messagesEndRef={messagesEndRef}
        allValueOptions={allValueOptions}
        onClose={handleTogglePanel}
        onNewSession={handleNewSession}
        onSendMessage={handleSendMessage}
        onFileSelect={handleFileSelect}
        onRemoveFile={handleRemoveFile}
        onClearFiles={handleClearFiles}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      />

      <GenOneButton
        onClick={handleTogglePanel}
        isOpen={isGenOneOpen}
        hasNotification={hasNotification}
        hasOrchestration={hasOrchestration}
        isLoading={genOneLoading}
      />

      <GenOneNotificationSubscriber onWorkflowNotification={handleWorkflowNotification} />
    </>
  );
};

export default GenOne;
