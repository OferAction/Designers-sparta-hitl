import { useCallback } from "react";

import { CaretUpDownIcon, PlusIcon } from "@phosphor-icons/react";

import useAncestorValueOptions from "@/modules/flow/hooks/useAncestorValueOptions";

import { Message, NodeVariant } from "./../../../types";
import {
  Terminal,
  TerminalHeader,
  TerminalTitle,
  TerminalContent,
  TerminalControls,
  CopyButton,
  DeleteButton,
  TerminalAlert,
} from "@/components/common/CodeTerminal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { SectionContainer } from "@/modules/flow/components/ContextualPanel/SectionContainer";
import { SectionTitle, SectionTitleButton } from "@/modules/flow/components/ContextualPanel/SectionTitle";
import { DynamicField } from "@/modules/flow/components/IO";
import { DynamicFieldValue } from "@/modules/flow/components/IO/DynamicField/types";
import { useSelectedNode } from "@/modules/flow/hooks";
import { genId } from "@/utils";

interface LLMInstructionsProps {
  systemPrompt: DynamicFieldValue;
  messages: Message[];
  onSystemPromptChange: (value: DynamicFieldValue) => void;
  onAddMessage: (messages: Message[]) => void;
}

export const LLMInstructions = ({ systemPrompt, messages, onSystemPromptChange, onAddMessage }: LLMInstructionsProps) => {
  const selectedNode = useSelectedNode<NodeVariant<"agent">>();
  const selectedNodeId = selectedNode?.id;
  const valueOptions = useAncestorValueOptions(selectedNodeId);

  const handleAddMessage = useCallback(() => {
    const newMessage: Message = { id: `msg_${genId()}`, role: "user", content: "" };
    onAddMessage([...messages, newMessage]);
  }, [messages, onAddMessage]);

  const handleRemoveMessage = useCallback(
    (id: string) => {
      const updatedMessages = messages.filter((msg) => msg.id !== id);
      onAddMessage(updatedMessages);
    },
    [messages, onAddMessage]
  );

  const handleRoleChange = useCallback(
    (messageId: string, newRole: Message["role"]) => {
      const updatedMessages = messages.map((msg) => (msg.id === messageId ? { ...msg, role: newRole } : msg));
      onAddMessage(updatedMessages);
    },
    [messages, onAddMessage]
  );

  const handleMessageContentChange = useCallback(
    (messageId: string, value: DynamicFieldValue) => {
      const updatedMessages = messages.map((msg) => (msg.id === messageId ? { ...msg, content: value } : msg));
      onAddMessage(updatedMessages);
    },
    [messages, onAddMessage]
  );

  const availableRoles: Message["role"][] = ["user", "assistant", "system", "image", "files"];
  return (
    <SectionContainer>
      <SectionTitle title="Input">
        <SectionTitleButton onClick={handleAddMessage} tooltip="Add Message">
          <PlusIcon className="size-4" />
        </SectionTitleButton>
      </SectionTitle>
      {/* System Prompt Section */}
      <Terminal
        key={`system-prompt-${selectedNodeId}`}
        defaultValue={systemPrompt}
        variant="input"
        className="h-full flex flex-1 bg-sidebar border-none"
      >
        <TerminalHeader className="px-0 flex items-center border-none">
          <TerminalTitle>System Prompt</TerminalTitle>
          <TerminalControls>
            <CopyButton value={systemPrompt} />
          </TerminalControls>
        </TerminalHeader>
        <TerminalContent>
          <DynamicField className="my-1" value={systemPrompt} onChange={onSystemPromptChange} scope={valueOptions} />
          <TerminalAlert />
        </TerminalContent>
      </Terminal>
      <div className="flex flex-col gap-3 py-3">
        {messages.map((message) => (
          <div key={message.id} className="relative gap-1">
            <div className="relative">
              <Terminal
                key={`message-${message.id}-${selectedNodeId}`}
                defaultValue={message.content}
                variant="input"
                className="h-full flex flex-1 bg-sidebar border-none"
              >
                <TerminalHeader className="px-0 flex items-center border-none">
                  <TerminalTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div className="cursor-pointer hover:bg-accent/10  rounded transition-colors flex items-center gap-1">
                          <span>{message.role}</span>
                          <CaretUpDownIcon className="h-3 w-3" />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {availableRoles.map((role) => (
                          <DropdownMenuItem
                            key={role}
                            onClick={() => handleRoleChange(message.id, role)}
                            className={cn("cursor-pointer", message.role === role && "bg-accent text-accent-foreground")}
                          >
                            {role}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TerminalTitle>
                  <TerminalControls>
                    <CopyButton value={message.content} />
                    <DeleteButton onDelete={() => handleRemoveMessage(message.id)} disabled={messages.length === 1} />
                  </TerminalControls>
                </TerminalHeader>
                <TerminalContent>
                  <DynamicField
                    className="my-1"
                    value={message.content}
                    onChange={(value) => handleMessageContentChange(message.id, value)}
                    scope={valueOptions}
                  />
                </TerminalContent>
              </Terminal>
            </div>
          </div>
        ))}
      </div>
    </SectionContainer>
  );
};

export default LLMInstructions;
