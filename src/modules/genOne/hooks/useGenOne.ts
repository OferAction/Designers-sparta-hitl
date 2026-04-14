import React, { useState, useRef, useEffect, useCallback } from "react";

import { useReactFlow } from "@xyflow/react";
import { useShallow } from "zustand/shallow";

import { useNotificationHub } from "@/lib/signalr/useNotificationHub";

import { ChatMessageProps } from "../components/ChatMessage";
import { useGenOneOrchestrator } from "../genOneService";
import { CANVAS_VIEW_SETTINGS } from "@/constants";
import { GenOneNotificationEvent } from "@/lib/signalr/types/serverToClient";
import { DynamicFieldValue } from "@/modules/flow/components/IO";
import { useAllValueOptions } from "@/modules/flow/hooks";
import { FlowStoreState, useFlowStore } from "@/store";

import { genId } from "@/utils/IdGenerator";

const ACCEPTED_FILE_TYPES = [".pdf", ".docx", ".txt"];

export const useGenOne = () => {
  const [messages, setMessages] = useState<ChatMessageProps[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { fitView } = useReactFlow();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dragCounterRef = useRef(0);

  const selector = (state: FlowStoreState) => ({
    isGenOneOpen: state.isGenOneOpen,
    setIsGenOneOpen: state.setIsGenOneOpen,
    sessionId: state.sessionId,
    genOneLoading: state.genOneLoading,
    setGenOneLoading: state.setGenOneLoading,
    setOrchestrationConfig: state.setOrchestrationConfig,
    newSession: state.newSession,
    nodes: state.nodes,
    edges: state.edges,
    hasNotification: state.hasNotification,
    setHasNotification: state.setHasNotification,
    hasOrchestration: state.hasOrchestration,
    setHasOrchestration: state.setHasOrchestration,
  });

  const {
    isGenOneOpen,
    setIsGenOneOpen,
    sessionId,
    setGenOneLoading,
    setOrchestrationConfig,
    genOneLoading,
    newSession,
    nodes,
    edges,
    hasNotification,
    setHasNotification,
    hasOrchestration,
    setHasOrchestration,
  } = useFlowStore(useShallow(selector));

  const { mutate: sendGenOneRequest } = useGenOneOrchestrator();
  const { unsubscribe } = useNotificationHub();
  const allValueOptions = useAllValueOptions();

  // Clear notifications when panel opens
  useEffect(() => {
    if (isGenOneOpen) {
      if (hasNotification) {
        setHasNotification(false);
      }
      if (hasOrchestration) {
        setHasOrchestration(false);
      }
    }
  }, [isGenOneOpen, hasNotification, hasOrchestration, setHasNotification, setHasOrchestration]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTogglePanel = useCallback(() => {
    setIsGenOneOpen(!isGenOneOpen);
  }, [isGenOneOpen, setIsGenOneOpen]);

  const handleNewSession = useCallback(async () => {
    try {
      await unsubscribe("genone_events", sessionId);
      console.log("Unsubscribed from old session:", sessionId);
    } catch (error) {
      console.error("Error unsubscribing from old session:", error);
    }

    setMessages([]);
    setSelectedFiles([]);
    newSession();
    setGenOneLoading(false);
    setHasNotification(false);
    setHasOrchestration(false);
  }, [sessionId, unsubscribe, newSession, setGenOneLoading, setHasNotification, setHasOrchestration]);

  const handleSendMessage = useCallback(
    (message: string, expression: DynamicFieldValue) => {
      if (!message.trim() && selectedFiles.length === 0) return;

      const newMessage: ChatMessageProps = {
        id: genId(),
        type: "user",
        content: message.trim() || "",
        expression,
        attachedFiles: selectedFiles.length > 0 ? [...selectedFiles] : undefined,
      };

      setMessages((prev) => [...prev, newMessage]);

      const loadingMessageId = genId();
      setMessages((prev) => [
        ...prev,
        {
          id: loadingMessageId,
          type: "system",
          content: "ActOne is processing...",
        },
      ]);

      setGenOneLoading(true);

      sendGenOneRequest(
        {
          prompt: message || "",
          session_id: sessionId,
          user_id: "user",
          files: selectedFiles.length > 0 ? selectedFiles : undefined,
          existing_config: {
            nodes,
            edges,
          },
        },
        {
          onSuccess: (response) => {
            console.log("ActOne API response:", response);
          },
          onError: (error) => {
            setMessages((prev) => [
              ...prev.filter((msg) => msg.id !== loadingMessageId),
              {
                id: genId(),
                type: "system",
                content: "Sorry, I encountered an error. Please try again.",
              },
            ]);
            setGenOneLoading(false);
            console.error("ActOne API error:", error);
          },
        }
      );

      // Clear files after sending
      setSelectedFiles([]);
    },
    [selectedFiles, sessionId, nodes, edges, sendGenOneRequest, setGenOneLoading]
  );

  const handleWorkflowNotification = useCallback(
    (event: GenOneNotificationEvent) => {
      setGenOneLoading(false);
      setMessages((prev) => prev.filter((msg) => msg.content !== "ActOne is processing..."));
      console.log("Received workflow notification:", event);

      if (event.workflowStatus === false) {
        if (event.message) {
          setMessages((prev) => [
            ...prev,
            {
              id: genId(),
              type: "workflow",
              content: event.message,
            },
          ]);
        }
        // Set notification dot if panel is closed
        if (!useFlowStore.getState().isGenOneOpen) {
          setHasNotification(true);
        }
      } else if (event.workflowStatus === true) {
        console.log("Workflow completed! Orchestration:", event);

        if (event.configuration) {
          try {
            const parsedConfiguration = JSON.parse(event.configuration);
            console.log("Parsed configuration:", parsedConfiguration);
            useFlowStore.setState({ isInitialized: false });
            setOrchestrationConfig(parsedConfiguration["config"]);
            setTimeout(() => {
              fitView(CANVAS_VIEW_SETTINGS);
            }, 400);

            console.log("Canvas configuration updated with GenOne workflow result");
          } catch (error) {
            console.error("Failed to parse configuration JSON:", error);
          }
        }

        // Set orchestration checkmark if panel is closed
        if (!useFlowStore.getState().isGenOneOpen) {
          setHasOrchestration(true);
        }

        setGenOneLoading(false);
      }
    },
    [setGenOneLoading, setOrchestrationConfig, fitView, setHasNotification, setHasOrchestration]
  );

  const handleFileSelect = useCallback((files: File[]) => {
    setSelectedFiles((prev) => [...prev, ...files]);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleClearFiles = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  // Drag and drop handlers
  const isValidFileType = useCallback((file: File) => {
    const fileName = file.name.toLowerCase();
    return ACCEPTED_FILE_TYPES.some((ext) => fileName.endsWith(ext));
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounterRef.current = 0;

      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = droppedFiles.filter(isValidFileType);

      if (validFiles.length > 0) {
        setSelectedFiles((prev) => [...prev, ...validFiles]);
      }
    },
    [isValidFileType]
  );

  return {
    // State
    messages,
    selectedFiles,
    isGenOneOpen,
    genOneLoading,
    hasNotification,
    hasOrchestration,
    isDragging,
    messagesEndRef,
    allValueOptions,

    // Actions
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
  };
};
