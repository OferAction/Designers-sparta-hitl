import React, { createContext, useContext } from "react";

import { InfoIcon } from "@phosphor-icons/react";

import { Spinner } from "@/components/common/Spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/utils";

interface ReliableCardContextType {
  isLoading?: boolean;
}

const ReliableCardContext = createContext<ReliableCardContextType | undefined>(undefined);

const useReliableCardContext = () => {
  const context = useContext(ReliableCardContext);
  if (!context) {
    throw new Error("ReliableCard compound components must be used within ReliableCard");
  }
  return context;
};

interface ReliableCardProps {
  className?: string;
  isLoading?: boolean;
  children: React.ReactNode;
}

interface ReliableCardTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface ReliableCardTooltipProps {
  content: string;
}

interface ReliableCardTriggerProps {
  children: React.ReactNode;
}

interface ReliableCardValueProps {
  children: React.ReactNode;
  className?: string;
}

interface ReliableCardIconProps {
  children: React.ReactNode;
}

interface ReliableCardSubtitleProps {
  children: React.ReactNode;
  className?: string;
}

function ReliableCard({ className, isLoading = false, children }: ReliableCardProps) {
  return (
    <ReliableCardContext.Provider value={{ isLoading }}>
      <Card className={cn("flex flex-col justify-between py-3 px-4 w-full bg-sidebar border-sidebar-border gap-6", className)}>{children}</Card>
    </ReliableCardContext.Provider>
  );
}

function ReliableCardHeader({ children }: { children: React.ReactNode }) {
  return <CardHeader className="flex flex-row justify-between items-center p-0 text-sidebar-foreground/70 space-y-0">{children}</CardHeader>;
}

function ReliableCardTitle({ children, className }: ReliableCardTitleProps) {
  return <CardTitle className={cn("text-sm leading-6", className)}>{children}</CardTitle>;
}

function ReliableCardTooltip({ content }: ReliableCardTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="py-1.5">
          <InfoIcon className="size-3 text-sidebar-foreground/70" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function ReliableCardTrigger({ children }: ReliableCardTriggerProps) {
  return <>{children}</>;
}

function ReliableCardBody({ children }: { children: React.ReactNode }) {
  return <CardContent className="p-0 flex justify-between">{children}</CardContent>;
}

function ReliableCardValue({ children, className }: ReliableCardValueProps) {
  const { isLoading } = useReliableCardContext();
  return <div className={cn("flex gap-2 items-center text-foreground leading-none font-bold", className)}>{isLoading ? <Spinner /> : children}</div>;
}

function ReliableCardIcon({ children }: ReliableCardIconProps) {
  return <>{children}</>;
}

function ReliableCardSubtitle({ children, className }: ReliableCardSubtitleProps) {
  return <p className={cn("text-xs", className)}>{children}</p>;
}

function ReliableCardContent({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-2">{children}</div>;
}

function ReliableCardExtra({ children }: { children: React.ReactNode }) {
  return <div className="self-end flex flex-col items-end">{children}</div>;
}

ReliableCard.Header = ReliableCardHeader;
ReliableCard.Title = ReliableCardTitle;
ReliableCard.Tooltip = ReliableCardTooltip;
ReliableCard.Trigger = ReliableCardTrigger;
ReliableCard.Body = ReliableCardBody;
ReliableCard.Content = ReliableCardContent;
ReliableCard.Value = ReliableCardValue;
ReliableCard.Icon = ReliableCardIcon;
ReliableCard.Subtitle = ReliableCardSubtitle;
ReliableCard.Extra = ReliableCardExtra;

export default ReliableCard;
