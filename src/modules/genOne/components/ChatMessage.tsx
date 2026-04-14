import React, { useMemo } from "react";

import ReactMarkdown from "react-markdown";

import FilePreview from "./FilePreview";
import MessageContent from "./MessageContent";
import { GenOneIcon } from "@/lib/icons";
import { DynamicFieldValue } from "@/modules/flow/components/IO";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/utils";

export interface ChatMessageProps {
  id: string;
  type: "system" | "user" | "workflow";
  content: string | React.ReactNode;
  expression?: DynamicFieldValue;
  attachedFiles?: File[];
  previousMessageType?: "system" | "user" | "workflow" | null;
}

// Helper function to get user initials
const getUserInitials = (name?: string): string => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const ChatMessage: React.FC<ChatMessageProps> = ({
  id,
  type,
  content,
  expression,
  attachedFiles = [],
  previousMessageType = null,
}) => {
  const { user } = useAuthStore();

  // Determine if logo should be shown (only first workflow message in a sequence)
  const showLogo = useMemo(() => {
    if (type !== "workflow") {
      return true;
    }
    // Show logo if previous message was not a workflow message
    return previousMessageType !== "workflow";
  }, [type, previousMessageType]);

  return (
    <div key={id} className={cn("max-w-[85%] min-w-[100px] break-words text-sm flex flex-col gap-2", type === "user" ? "ml-auto" : "")}>
      {type === "user" ? (
        <div className="flex gap-1.5 items-end justify-end ">
          <div className="flex flex-col gap-2 items-end">
            {/* Text content */}
            {content && (
              <div className="break-words overflow-wrap-anywhere bg-secondary p-3 rounded-xl">
                {typeof content === "string" ? (
                  <MessageContent expression={expression} fallbackText={content} />
                ) : (
                  content
                )}
              </div>
            )}
            {attachedFiles.length > 0 && (
              <div className="">
                <FilePreview files={attachedFiles} variant="message" />
              </div>
            )}

          </div>
          <div className="w-8 h-8 flex-shrink-0 bg-muted rounded-full flex items-center justify-center text-muted-foreground text-xs font-medium">
            {getUserInitials(user?.name)}
          </div>
        </div>
      ) : type === "workflow" ? (
        <div className="flex gap-2 items-start flex-col">
          {showLogo && <GenOneIcon className="w-6 h-6 flex-shrink-0 bg-slate-800 rounded-full p-[3px] text-muted-foreground" />}
          <div className={"break-words overflow-wrap-anywhere prose prose-sm max-w-none p-0.5"}>
            <ReactMarkdown>{typeof content === "string" ? content : ""}</ReactMarkdown>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 items-center ">
          <GenOneIcon className="w-6 h-6 flex-shrink-0 bg-slate-800 rounded-full p-[1px]" />
          <div className="break-words overflow-wrap-anywhere bg-ai-gradient text-gradient">{content}</div>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
