import React from "react";

import { PlusIcon, XIcon } from "@phosphor-icons/react";

import { GenOneGradientIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  onClose: () => void;
  onNewSession: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onClose, onNewSession }) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-border">
      <div className="flex items-center gap-2">
        <GenOneGradientIcon className="w-6 h-6" />
        <h2 className="font-medium">ActOne</h2>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewSession}
          title="New Session"
          className="hover:bg-primary/10 transition-colors duration-200 hover:scale-105 active:scale-95"
        >
          <PlusIcon className="h-5 w-5 transition-transform duration-200 hover:rotate-90" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <XIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
